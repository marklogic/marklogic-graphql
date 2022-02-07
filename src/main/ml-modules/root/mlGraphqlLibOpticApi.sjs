// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: 'development'} };

const { parse } = require('/graphql/language/parser');
const { print } = require('/graphql/language/printer');
const op = require('/MarkLogic/optic');

const graphqlTraceEvent = "GRAPHQL";
let errors = [];

function processJoin(joinField, fromColumnName) {
    const foreignSelectionSet = joinField.selectionSet
    const toColumnName = foreignSelectionSet.selections[0].name.value;
    console.log("Found a Join. From " + fromColumnName + " to " + toColumnName);
    const joinViewName = joinField.name.value;
    let joinView = op.fromView(null, joinViewName)
    joinView = addWhereClausesFromArguments(joinView, joinField.arguments, joinViewName);

    const foreignFields = [];
    for (let j = 0; j < foreignSelectionSet.selections.length; j++) {
        const foreignFieldName = foreignSelectionSet.selections[j].name.value;
        foreignFields.push(op.prop(foreignFieldName, op.col(foreignFieldName)));
    }
    // Select the ID column and create a second column with a constructed JSON object
    joinView = joinView.select([
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

function addWhereClausesFromArguments(opticPlan, arguments, viewName) {
    console.log("Arguments: " + JSON.stringify(arguments));
    for (let i = 0; i < arguments.length; i++) {
        const argumentName = arguments[i].name.value;
        const argumentValue = arguments[i].value.value;
        opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
    }
    return opticPlan;
}

function addFieldInformation(opticPlan, fieldSelectionSet, viewName) {
    const columnNames = [];
    const viewColumns = [];
    const joinViews = [];
    let numFields = fieldSelectionSet.selections.length;

    // Get field information
    // If the field is a join, dig down.
    const fromColumnName = fieldSelectionSet.selections[0].name.value;
    for (let i = 0; i < numFields; i++) {
        const columnName = fieldSelectionSet.selections[i].name.value;
        const foreignSelectionSet = fieldSelectionSet.selections[i].selectionSet
        if (foreignSelectionSet) {
            const joinField = fieldSelectionSet.selections[i]
            const joinViewInfo = processJoin(joinField, fromColumnName);
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
    return opticPlan;
}

function processPrimaryView(node) {
    const viewName = node.selectionSet.selections[0].name.value;
    let opticPlan = op.fromView(null, viewName);
    opticPlan = addWhereClausesFromArguments(opticPlan, node.selectionSet.selections[0].arguments, viewName);

    const fieldSelectionSet = node.selectionSet.selections[0].selectionSet;
    if (!fieldSelectionSet) {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }
    opticPlan = addFieldInformation(opticPlan, fieldSelectionSet, viewName);
    opticPlan = opticPlan.groupBy(null, op.arrayAggregate(viewName, op.col(viewName)))
    return opticPlan;
}

function processQuery(operationNode) {
    fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
    let opticPlan = processPrimaryView(operationNode);
    if (!opticPlan) {
        return null;
    }
    const viewName = operationNode.selectionSet.selections[0].name.value;
    opticPlan = opticPlan.select(
        op.as(
            "data",
            op.jsonObject([
                op.prop(viewName, op.col(viewName))
            ])
        )
    )
    return opticPlan;
}

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
    let opticPlan = null;
    let queryDocumentAst = null;
    errors = [];

    try {
        queryDocumentAst = parse(graphQlQueryStr);
        fn.trace("GraphQL AST: " + JSON.stringify(queryDocumentAst), graphqlTraceEvent);
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

    if (queryDocumentAst.kind = "Document") {
        const numDefinitions = queryDocumentAst.definitions.length;
        for (let d = 0; d < numDefinitions; d++) {
            if (queryDocumentAst.definitions[d].operation === "query") {
                opticPlan = processQuery(queryDocumentAst.definitions[d]);
                fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);
            }
        }
    }

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