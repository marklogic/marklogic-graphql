// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: 'development'} };

const { parse } = require('/graphql/language/parser');
const { visit } = require('/graphql/language/visitor');
const { print } = require('/graphql/language/printer');
const op = require('/MarkLogic/optic');

const graphqlTraceEvent = "GRAPHQL";

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
    let opticPlan = null;
    const errors = [];
    let queryDocumentAst = null;

    try {
        queryDocumentAst = parse(graphQlQueryStr);
    } catch (error) {
        const errorMessage = "Error parsing the GraphQL Query string: \n" + graphQlQueryStr;
        console.error(errorMessage);
        errors.push(errorMessage);
        return {
            graphqlQuery : graphQlQueryStr,
            opticAst : null,
            opticPlan : null,
            data : null,
            errors: errors
        }
    }
    fn.trace("GraphQL AST: " + JSON.stringify(queryDocumentAst), graphqlTraceEvent);

    let depth = 0;
    let expectingAQuery = false;
    let inAQuery = false;
    let currentQueryName = null;
    let lookingForViewName = false;

    const documentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            return visit(node.definitions[0], nodeTypeVisitors);
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const operationDefinitionVisitor =  {
        enter(node, key, parent, path, ancestors) {
            depth++;
            if (node.operation === "query") {
                expectingAQuery = true;
                fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
                const viewName = node.selectionSet.selections[0].name.value;
                opticPlan = op.fromView(null, viewName);

                const numArguments = node.selectionSet.selections[0].arguments.length;
                for (let i = 0; i < numArguments; i++) {
                    const argumentName = node.selectionSet.selections[0].arguments[i].name.value;
                    const argumentValue = node.selectionSet.selections[0].arguments[i].value.value;
                    opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
                }

                const columnNames = [];
                let numFields = null;
                if (node.selectionSet.selections[0].selectionSet) {
                    numFields = node.selectionSet.selections[0].selectionSet.selections.length;
                } else {
                    const errorMessage = "Queries must contain a SelectionSet for each View: \n" + graphQlQueryStr;
                    fn.trace(errorMessage, graphqlTraceEvent);
                    errors.push(errorMessage);
                    return false;
                }
                let joinViews = [];
                for (let i = 0; i < numFields; i++) {
                    const columnName = node.selectionSet.selections[0].selectionSet.selections[i].name.value;
                    if (node.selectionSet.selections[0].selectionSet.selections[i].selectionSet) {
                        const fromColumnName = node.selectionSet.selections[0].selectionSet.selections[0].name.value;
                        const toColumnName = node.selectionSet.selections[0].selectionSet.selections[i].selectionSet.selections[0].name.value;
                        console.log("Found a Join. From " + fromColumnName + " to " + toColumnName);
                        joinView = op.fromView(null, columnName)
                            // Select the ID column and create a second column with a constructed JSON object
                            .select([
                                op.viewCol(columnName, toColumnName),
                                op.as(
                                    'joinView',
                                    op.jsonObject([
                                        op.prop('ownerId', op.col('ownerId')),
                                        op.prop('year', op.col('year')),
                                        op.prop('model', op.col('model'))
                                    ])
                                )
                            ]);
                        joinViews.push(joinView);
                        // opticPlan = opticPlan.joinLeftOuter(
                        //     joinView,
                        //     op.on(op.viewCol(viewName, fromColumnName), op.viewCol(columnName, toColumnName))
                        // ).groupBy(
                        //     op.viewCol(viewName, fromColumnName),
                        //     [
                        //         op.viewCol(viewName,'name'),
                        //         op.arrayAggregate(columnName,op.col('joinView'))
                        //     ]
                        // );
                    } else {
                       columnNames.push(op.prop(columnName, op.viewCol(viewName, columnName)));
                    }
                }
                opticPlan = opticPlan.select(
                    op.as(
                        viewName,
                        op.jsonObject(columnNames)
                    )
                )
                opticPlan = opticPlan.groupBy(null, op.arrayAggregate(viewName, op.col(viewName)))

                opticPlan = opticPlan.select(
                    op.as(
                        "data",
                        op.jsonObject([
                            op.prop(viewName, op.col(viewName))
                        ])
                    )
                )
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const selectionSetVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            if ((parent) && (parent.kind === "OperationDefinition") && expectingAQuery) {
                inAQuery = true;
                lookingForViewName = true;
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const argumentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const fieldVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            if ((key === 0) && lookingForViewName) {
                const viewName = node.name.value;
                lookingForViewName = false;

                if (node.arguments.length > 0) {
                    const argumentName = node.arguments[0].name.value;
                    const argumentValue = node.arguments[0].value.value;
                }
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const nameVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            if ((parent.kind === "OperationDefinition") && expectingAQuery) {
                currentQueryName = node.value;
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const stringValueVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const nodeTypeVisitors = {
        Document: documentVisitor,
        OperationDefinition: operationDefinitionVisitor,
        SelectionSet: selectionSetVisitor,
        Argument: argumentVisitor,
        Field: fieldVisitor,
        Name: nameVisitor,
        StringValue: stringValueVisitor,

        enter(node, key, parent, path, ancestors) {
            depth++;
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }
    const opticAst = visit(queryDocumentAst, nodeTypeVisitors);
    fn.trace("transformToJsonAst=>\n" + JSON.stringify(opticAst) + "\nEnd transformToJsonAst", graphqlTraceEvent);
    fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);


    return {
        graphqlQuery : graphQlQueryStr,
        opticAst : opticAst,
        opticPlan : opticPlan,
        data : null,
        errors: errors
    }
}

function executeOpticPlan(opticPlan) {
    const planObj = opticPlan.export();
    fn.trace("Plan Export\n" + op.toSource(planObj), graphqlTraceEvent);

    let result = opticPlan.result();
    fn.trace("Optic Plan Result\n" + result + "Optic Plan Result Finished", graphqlTraceEvent);

    const nb = new NodeBuilder();
    nb.addNode(Sequence.from(result).toArray()[0]);
    return nb.toNode();
    // return result;
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.executeOpticPlan = executeOpticPlan;