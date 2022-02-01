// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: 'development'} };

const { parse } = require('/graphql/language/parser');
const { visit } = require('/graphql/language/visitor');
const { print } = require('/graphql/language/printer');

function callGraphQlParse(graphQlQueryStr) {
    let queryDocumentAst = null;
    try {
        queryDocumentAst = parse(graphQlQueryStr);
    } catch (error) {
        const errorMessage = "Error parsing the GraphQL Query string: \n" + graphQlQueryStr;
        console.error(errorMessage);
        return {
            graphqlQuery : graphQlQueryStr,
            opticDsl : null,
            data : null,
            errors: [errorMessage]
        }
    }
    console.log("Begin AST");
    console.log(queryDocumentAst);
    console.log("End AST");
    console.log(print(queryDocumentAst));
    console.log("Post AST");

    let depth = 0;
    let expectingAQuery = false;
    let inAQuery = false;
    let currentQueryName = null;
    let lookingForViewName = false;

    const documentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a Document, depth=" + depth);
            return visit(node.definitions[0], nodeTypeVisitors);
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a Document, depth=" + depth);
        }
    }

    const operationDefinitionVisitor =  {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a OperationDefinition, depth=" + depth);
            if (node.operation === "query") {
                expectingAQuery = true;
                console.log("OperationDefinition is for a query");
                const viewName = node.selectionSet.selections[0].name.value;
                const viewAst = {"ns":"op", "fn":"from-view", "args":[null, viewName, null, null]}
                console.log("viewAst: " + JSON.stringify(viewAst));
                const queryAstArguments = [viewAst];

                const columnAstArguments = [];
                const numFields = node.selectionSet.selections[0].selectionSet.selections.length;
                for (let i = 0; i < numFields; i++) {
                    const columnName = node.selectionSet.selections[0].selectionSet.selections[i].name.value;
                    columnAstArguments.push({
                        "ns":"op",
                        "fn":"col",
                        "args":[columnName]
                    })
                }
                const selectAst = {
                    "ns":"op",
                    "fn":"select",
                    "args":[
                        columnAstArguments,
                        null
                    ]
                }
                queryAstArguments.push(selectAst);

                const numArguments = node.selectionSet.selections[0].arguments.length;
                for (let i = 0; i < numArguments; i++) {
                    const argumentName = node.selectionSet.selections[0].arguments[i].name.value;
                    const argumentValue = node.selectionSet.selections[0].arguments[i].value.value;
                    const whereAst = {
                        "ns":"op",
                        "fn":"where",
                        "args":[{
                            "ns":"op",
                            "fn":"eq",
                            "args":[
                                {
                                    "ns":"op",
                                    "fn":"col",
                                    "args":[argumentName]
                                },
                                argumentValue
                            ]
                        }]
                    }
                    queryAstArguments.push(whereAst);
                }

                const queryAst = {
                    "$optic": {
                        "ns":"op",
                        "fn": "operators",
                        "args": queryAstArguments
                    }
                }
                return queryAst;
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a OperationDefinition, depth=" + depth);
            if (node.operation === "query") {
                console.log("Rewriting OperationDefinition node");
            }
        }
    }

    const selectionSetVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a SelectionSet, depth=" + depth);
            if ((parent) && (parent.kind === "OperationDefinition") && expectingAQuery) {
                inAQuery = true;
                lookingForViewName = true;
                console.log("SelectionSet is starting query");
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a SelectionSet, depth=" + depth);
        }
    }

    const argumentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a Argument, depth=" + depth);
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a Argument, depth=" + depth);
        }
    }

    const fieldVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a Field, key=" + key + ", depth=" + depth);
            if ((key === 0) && lookingForViewName) {
                const viewName = node.name.value;
                lookingForViewName = false;

                if (node.arguments.length > 0) {
                    console.log("FOUND ARGUMENTS FOR THE QUERY");
                    const argumentName = node.arguments[0].name.value;
                    const argumentValue = node.arguments[0].value.value;
                }
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a Field, key=" + key + ", depth=" + depth);
        }
    }

    const nameVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a Name, depth=" + depth);
            if ((parent.kind === "OperationDefinition") && expectingAQuery) {
                currentQueryName = node.value;
                console.log("currentQueryName = " + currentQueryName);
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a Name, depth=" + depth);
        }
    }

    const stringValueVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a StringValueVisitor, depth=" + depth);
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a StringValueVisitor, depth=" + depth);
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
            console.log("Entering unhandled node, key: " + key + ", depth=" + depth);
            console.log(node);
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            // console.log("Exiting unhandled node, key: " + key + ", depth=" + depth);
        }
    }
    const opticAst = visit(queryDocumentAst, nodeTypeVisitors);

    return {
        graphqlQuery : graphQlQueryStr,
        opticAst : opticAst,
        data : null
    }
}

exports.callGraphQlParse = callGraphQlParse;