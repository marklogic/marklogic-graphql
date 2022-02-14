// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: 'development'} };

const { parse } = require('/graphql/language/parser');
const { print } = require('/graphql/language/printer');
const op = require('/MarkLogic/optic');

const graphqlTraceEvent = "GRAPHQL";
let errors = [];

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
    let opticPlan = null;
    let queryDocumentAst = null;
    errors = [];

    try {
        queryDocumentAst = parse(graphQlQueryStr);
//        fn.trace("GraphQL AST: " + JSON.stringify(queryDocumentAst), graphqlTraceEvent);
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
//                fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);
            }
        }
    }

    return {
        graphqlQuery : graphQlQueryStr,
        opticPlan : opticPlan,
        errors: errors
    }
}

function processQuery(operationNode) {
    fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
    let queryField = operationNode.selectionSet.selections[0];
    let opticPlan = processView(queryField);
    if (!opticPlan) {
        return null;
    }
    const viewName = queryField.name.value;
    opticPlan = opticPlan.groupBy(null, [op.arrayAggregate(op.col(viewName), op.col(viewName), null)])
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

// In this case, a queryField is a Field with defined SelectionSet
function processView(queryField, parentViewName, fromColumnName) {
    console.log("processView");
    console.log("parentViewName: " + parentViewName);
    const viewName = queryField.name.value;
    let viewNodePlan = null;

    const fieldSelectionSet = queryField.selectionSet;
    if (!fieldSelectionSet) {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }

    viewNodePlan = op.fromView(null, viewName);
    viewNodePlan = addWhereClausesFromArguments(viewNodePlan, queryField.arguments, viewName);

    const fieldInfo = getInformationFromFields(fieldSelectionSet, viewName, fromColumnName);
    const aggregateColumnNames = [];
    const previousAggregateColumnNames = [];
    for (let i=0; i < fieldInfo.joinViewInfos.length; i++) {
        const currentJoinViewInfo = fieldInfo.joinViewInfos[i]
        console.log("foreignJoinPlan: " + op.toSource(currentJoinViewInfo.foreignJoinPlan.export()));
        viewNodePlan = viewNodePlan.joinLeftOuter(
            fieldInfo.joinViewInfos[i].foreignJoinPlan,
            op.on(op.viewCol(viewName, currentJoinViewInfo.fromColumnName), op.viewCol(currentJoinViewInfo.joinViewName, currentJoinViewInfo.toColumnName))
        )
        const groupByViewColumns = [];
        console.log("fieldInfo.nonJoinColumnNameStrings: " + fieldInfo.nonJoinColumnNameStrings);

        for (let j=0; j < fieldInfo.includeInGroupBy.length; j++) {
            groupByViewColumns.push(op.viewCol(viewName, fieldInfo.includeInGroupBy[j]));
        }
        for (let j=0; j < fieldInfo.nonJoinColumnNameStrings.length; j++) {
            if (!fieldInfo.includeInGroupBy.includes(fieldInfo.nonJoinColumnNameStrings[j])) {
                if (fieldInfo.nonJoinColumnNameStrings[j] !== currentJoinViewInfo.fromColumnName) {
                    groupByViewColumns.push(op.viewCol(viewName, fieldInfo.nonJoinColumnNameStrings[j]));
                }
            }
        }
        for (let j=0; j < previousAggregateColumnNames.length; j++) {
            groupByViewColumns.push(op.col(previousAggregateColumnNames[j]));
        }
        groupByViewColumns.push(op.arrayAggregate(currentJoinViewInfo.joinViewName, op.col(currentJoinViewInfo.joinViewName)));

        viewNodePlan = viewNodePlan.groupBy([op.viewCol(viewName, currentJoinViewInfo.fromColumnName)], groupByViewColumns);
        aggregateColumnNames.push(currentJoinViewInfo.joinViewName);
        previousAggregateColumnNames.push(op.col(currentJoinViewInfo.joinViewName));
    }

    const jsonColumns = [];
    for (let i=0; i < fieldInfo.nonJoinColumnNameStrings.length; i++) {
        jsonColumns.push(op.prop(fieldInfo.nonJoinColumnNameStrings[i], op.col(fieldInfo.nonJoinColumnNameStrings[i])));
    }
    for (let i=0; i < aggregateColumnNames.length; i++) {
        jsonColumns.push(op.prop(aggregateColumnNames[i], op.col(aggregateColumnNames[i])));
    }
    console.log("jsonColumns: " + jsonColumns);

    const toColumnName = fieldSelectionSet.selections[0].name.value;
    const selectColumnArray = fromColumnName ?
        [ op.viewCol(viewName, toColumnName), op.as(viewName, op.jsonObject(jsonColumns)) ] :
        op.as(viewName, op.jsonObject(jsonColumns))
    viewNodePlan = viewNodePlan.select(selectColumnArray);

    return viewNodePlan;
}

function addWhereClausesFromArguments(opticPlan, fieldArguments, viewName) {
    for (let i = 0; i < fieldArguments.length; i++) {
        const argumentName = fieldArguments[i].name.value;
        const argumentValue = fieldArguments[i].value.value;
        opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
    }
    return opticPlan;
}

function getInformationFromFields(fieldSelectionSet, viewName, fromColumnName) {
    const nonJoinColumnNameStrings = [];
    const includeInGroupBy = [];
    const joinViewInfos = [];
    let numFields = fieldSelectionSet.selections.length;

    // Get field information
    for (let i = 0; i < numFields; i++) {
        const columnName = fieldSelectionSet.selections[i].name.value;
        const foreignSelectionSet = fieldSelectionSet.selections[i].selectionSet
        // If the field is a join, drill down.
        if (foreignSelectionSet) {
            const keyNames = getKeyNames(foreignSelectionSet);
            let fromColumnName = keyNames.parentJoinColumn;
            const joinField = fieldSelectionSet.selections[i]
            const foreignJoinPlan = processView(joinField, viewName, fromColumnName);
            const joinViewInfo = {
                "foreignJoinPlan" : foreignJoinPlan,
                "fromColumnName" : fromColumnName,
                "toColumnName" : keyNames.childJoinColumn,
                "joinViewName" : columnName
            }
            joinViewInfos.push(joinViewInfo);
        } else {
            let includeThisFieldInResults = true;
            for (let j=0; j < fieldSelectionSet.selections[i].directives.length; j++) {
                if (fieldSelectionSet.selections[i].directives[j].name.value === "childJoinColumn") {
                    includeInGroupBy.push(columnName)
                    includeThisFieldInResults = false;
                }
                if (fieldSelectionSet.selections[i].directives[j].name.value === "parentJoinColumn") {
                    includeThisFieldInResults = false;
                    break;
                }
            }
            if (includeThisFieldInResults) {
                nonJoinColumnNameStrings.push(columnName);
            }
        }
    }
    return {
        "joinViewInfos" : joinViewInfos,
        "includeInGroupBy" : includeInGroupBy,
        "nonJoinColumnNameStrings" : nonJoinColumnNameStrings
    }
}

function getKeyNames(selectionSet) {
    let parentJoinColumn = null;
    let childJoinColumn = null;
    for (let i=0; i < selectionSet.selections.length; i++) {
        if (selectionSet.selections[i].directives.length > 0) {
            for (let j=0; j < selectionSet.selections[i].directives.length; j++) {
                if (selectionSet.selections[i].directives[j].name.value === "parentJoinColumn") {
                    parentJoinColumn = selectionSet.selections[i].name.value;
                }
                if (selectionSet.selections[i].directives[j].name.value === "childJoinColumn") {
                    childJoinColumn = selectionSet.selections[i].name.value;
                }
            }
        }
    }
    return {
        "childJoinColumn" : childJoinColumn,
        "parentJoinColumn" : parentJoinColumn
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