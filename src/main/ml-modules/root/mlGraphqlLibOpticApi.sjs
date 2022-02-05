// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: 'development'} };

const { parse } = require('/graphql/language/parser');
const { visit } = require('/graphql/language/visitor');
const { print } = require('/graphql/language/printer');
const op = require('/MarkLogic/optic');

const graphqlTraceEvent = "GRAPHQL";
let errors = [];

function processJoin(joinViewName, foreignSelectionSet, fromColumnName) {
    const toColumnName = foreignSelectionSet.selections[0].name.value;
    console.log("Found a Join. From " + fromColumnName + " to " + toColumnName);

    const foreignFields = [];
    for (let j = 0; j < foreignSelectionSet.selections.length; j++) {
        const foreignFieldName = foreignSelectionSet.selections[j].name.value;
        foreignFields.push(op.prop(foreignFieldName, op.col(foreignFieldName)));
    }
    joinView = op.fromView(null, joinViewName)
        // Select the ID column and create a second column with a constructed JSON object
        .select([
            op.viewCol(joinViewName, toColumnName),
            op.as(
                joinViewName,
                op.jsonObject(foreignFields)
            )
        ]);
    const joinViewInfo = {
        "joinView" : joinView,
        "joinViewName" : joinViewName,
        "fromColumnName" : fromColumnName,
        "toColumnName" : toColumnName
    }
    return joinViewInfo;
}

function processView(node) {
    const viewName = node.selectionSet.selections[0].name.value;
    opticPlan = op.fromView(null, viewName);

    const numArguments = node.selectionSet.selections[0].arguments.length;
    for (let i = 0; i < numArguments; i++) {
        const argumentName = node.selectionSet.selections[0].arguments[i].name.value;
        const argumentValue = node.selectionSet.selections[0].arguments[i].value.value;
        opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
    }

    const columnNames = [];
    const viewColumns = [];
    const joinViews = [];
    let numFields = null;
    if (node.selectionSet.selections[0].selectionSet) {
        numFields = node.selectionSet.selections[0].selectionSet.selections.length;
    } else {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }

    // Get field information
    // If the field is a join, dig down.
    const fromColumnName = node.selectionSet.selections[0].selectionSet.selections[0].name.value;
    for (let i = 0; i < numFields; i++) {
        const columnName = node.selectionSet.selections[0].selectionSet.selections[i].name.value;
        const foreignSelectionSet = node.selectionSet.selections[0].selectionSet.selections[i].selectionSet
        if (foreignSelectionSet) {
            const joinViewInfo = processJoin(columnName, foreignSelectionSet, fromColumnName);
            columnNames.push(op.prop(joinViewInfo.joinViewName, op.col(joinViewInfo.joinViewName)));
            joinViews.push(joinViewInfo);
            viewColumns.push(op.arrayAggregate(joinViewInfo.joinViewName,op.col(joinViewInfo.joinViewName)))
        } else {
            columnNames.push(op.prop(columnName, op.viewCol(viewName, columnName)));
            viewColumns.push(op.viewCol(viewName,columnName));
        }
    }

    // If there are any joins, add them
    if (joinViews.length > 0) {
        const currentView = joinViews[0];
        opticPlan = opticPlan.joinLeftOuter(
            currentView.joinView,
            op.on(op.viewCol(viewName, currentView.fromColumnName), op.viewCol(currentView.joinViewName, currentView.toColumnName))
        ).groupBy(
            op.viewCol(viewName, currentView.fromColumnName),
            viewColumns.slice(1)
        );
    }

    // Add all the columns to the JSON object built for the view
    opticPlan = opticPlan.select(
        op.as(
            viewName,
            op.jsonObject(columnNames)
        )
    )
    opticPlan = opticPlan.groupBy(null, op.arrayAggregate(viewName, op.col(viewName)))
    return opticPlan;
}

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
    let opticPlan = null;
    let queryDocumentAst = null;
    errors = [];

    try {
        queryDocumentAst = parse(graphQlQueryStr);
    } catch (error) {
        const errorMessage = "Error parsing the GraphQL Query string: \n" + graphQlQueryStr;
        console.error(errorMessage);
        errors.push(errorMessage);
        return {
            graphqlQuery : graphQlQueryStr,
            opticPlan : null,
            errors: errors
        }
    }
    fn.trace("GraphQL AST: " + JSON.stringify(queryDocumentAst), graphqlTraceEvent);

    let depth = 0;
    let expectingAQuery = false;

    const documentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const operationDefinitionVisitor =  {
        enter(node, key, parent, path, ancestors) {
            depth++;
            if (node.operation === "query") {
                fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
                opticPlan = processView(node);
                if (!opticPlan) { return false }
                const viewName = node.selectionSet.selections[0].name.value;

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
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
        }
    }

    const nameVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
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
    visit(queryDocumentAst, nodeTypeVisitors);
    fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);


    return {
        graphqlQuery : graphQlQueryStr,
        opticPlan : opticPlan,
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
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.executeOpticPlan = executeOpticPlan;