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
    for (let i = 0; i < arguments.length; i++) {
        const argumentName = arguments[i].name.value;
        const argumentValue = arguments[i].value.value;
        opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
    }
    return opticPlan;
}

function getInformationFromFields(fieldSelectionSet, viewName) {
    const columnNames = [];
    const nonJoinColumnNameStrings = [];
    const joinViewInfos = [];
    let numFields = fieldSelectionSet.selections.length;

    // Get field information
    // If the field is a join, drill down.
    for (let i = 0; i < numFields; i++) {
        const columnName = fieldSelectionSet.selections[i].name.value;
        const foreignSelectionSet = fieldSelectionSet.selections[i].selectionSet
        if (foreignSelectionSet) {
            const joinField = fieldSelectionSet.selections[i]
            const fromColumnName = fieldSelectionSet.selections[i+1].name.value;
            const joinViewInfo = processJoin(joinField, fromColumnName);
            columnNames.push(op.prop(joinViewInfo.joinViewName, op.col(joinViewInfo.joinViewName)));
            joinViewInfos.push(joinViewInfo);
            i++;
        } else {
            columnNames.push(op.prop(columnName, op.viewCol(viewName, columnName)));
            nonJoinColumnNameStrings.push(columnName);
        }
    }
    return {
        "columnNames" : columnNames,
        "nonJoinColumnNameStrings" : nonJoinColumnNameStrings,
        "joinViewInfos" : joinViewInfos
    }
}

function processPrimaryView(node) {
    const primaryViewName = node.selectionSet.selections[0].name.value;
    let opticPlan = null;

    const fieldSelectionSet = node.selectionSet.selections[0].selectionSet;
    if (!fieldSelectionSet) {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }

    opticPlan = op.fromView(null, primaryViewName);
    opticPlan = addWhereClausesFromArguments(opticPlan, node.selectionSet.selections[0].arguments, primaryViewName);

    const fieldInfo = getInformationFromFields(fieldSelectionSet, primaryViewName);
    const previousAggregateColumnNames = [];
    for (let i=0; i < fieldInfo.joinViewInfos.length; i++) {
        const currentView = fieldInfo.joinViewInfos[i];
        const currentViewName = currentView.joinViewName;

        const aggregateColumns = []
        for (let j=1; j < fieldInfo.nonJoinColumnNameStrings.length; j++) {
            aggregateColumns.push(
                op.viewCol(primaryViewName, fieldInfo.nonJoinColumnNameStrings[j])
            );
        }
        for (let j=0; j < previousAggregateColumnNames.length; j++) {
            aggregateColumns.push(
                op.col(previousAggregateColumnNames[j])
            );
        }
        aggregateColumns.push(
            op.arrayAggregate(currentViewName,op.col(currentViewName))
        );
        previousAggregateColumnNames.push(currentViewName);

        opticPlan = opticPlan.joinLeftOuter(
            currentView.joinView,
            op.on(op.viewCol(primaryViewName, currentView.fromColumnName), op.viewCol(currentViewName, currentView.toColumnName))
        ).groupBy(
            op.viewCol(primaryViewName, currentView.fromColumnName),
            aggregateColumns
        );
    }

    // Add all the columns to the JSON object built for the view
    opticPlan = opticPlan.select(
        op.as(
            primaryViewName,
            op.jsonObject(fieldInfo.columnNames)
        )
    )
    opticPlan = opticPlan.groupBy(null, op.arrayAggregate(primaryViewName, op.col(primaryViewName)))
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