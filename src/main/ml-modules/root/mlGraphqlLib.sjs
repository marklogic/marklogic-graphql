const {parse} = require('/graphql/language/parser');
const { visit } = require('/graphql/language/visitor');
const { print } = require('/graphql/language/printer');

function callGraphQlParse(graphQlQueryStr) {
    const queryDocumentAst = parse(graphQlQueryStr);
    console.log("Begin AST");
    console.log(queryDocumentAst);
    console.log("End AST");
    console.log(print(queryDocumentAst));
    console.log("Post AST");

    let depth = 0;
    let expectingAQuery = false;
    let inAQuery = false;
    let currentQueryName = null;
    let opticAstString = "";
    let lookingForViewName = false;

    const documentVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a Document, depth=" + depth);
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
            }
        },
        leave(node, key, parent, path, ancestors) {
            depth--;
            console.log("Exiting a OperationDefinition, depth=" + depth);
        }
    }

    const selectionSetVisitor = {
        enter(node, key, parent, path, ancestors) {
            depth++;
            console.log("Entering a SelectionSet, depth=" + depth);
            if ((parent.kind === "OperationDefinition") && expectingAQuery) {
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
                opticAstString += "op.fromView(null, '" + viewName + "')";
                lookingForViewName = false;

                if (node.arguments.length > 0) {
                    console.log("FOUND ARGUMENTS FOR THE QUERY");
                    const argumentName = node.arguments[0].name.value;
                    const argumentValue = node.arguments[0].value.value;
                    opticAstString += ".where(op.eq(op.col('" + argumentName + "'), '" + argumentValue + "'))";
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
            console.log("Exiting unhandled node, key: " + key + ", depth=" + depth);
        }
    }
    visit(queryDocumentAst, nodeTypeVisitors);

    return opticAstString;
}

exports.callGraphQlParse = callGraphQlParse;