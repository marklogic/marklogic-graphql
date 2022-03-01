"use strict";
/* global NodeBuilder, Sequence */ // For ESLint

// An internal GraphQL module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: "development"} };

const { parse } = require("/graphql/language/parser");
const op = require("/MarkLogic/optic.sjs");

const graphqlTraceEvent = "GRAPHQL";
let errors = [];

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
    let opticPlan = null;
    let queryDocumentAst = null;
    errors = [];

    try {
        queryDocumentAst = parse(graphQlQueryStr);
        // fn.trace("GraphQL AST: " + JSON.stringify(queryDocumentAst), graphqlTraceEvent);
    } catch (error) {
        const errorMessage =
            "Error parsing the GraphQL Query string: \n" + graphQlQueryStr;
        console.error(errorMessage);
        errors.push(errorMessage);
        return {
            "graphqlQuery" : graphQlQueryStr,
            "opticPlan" : null,
            "errors": errors
        };
    }

    if (queryDocumentAst.kind === "Document") {
        queryDocumentAst.definitions.forEach( function(definition) {
            if (definition.operation === "query") {
                opticPlan = processQuery(definition);
                // fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);
            }
        });
    }

    return {
        "graphqlQuery" : graphQlQueryStr,
        "opticPlan" : opticPlan,
        "errors": errors
    };
}

function processQuery(operationNode) {
    fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
    let queryField = operationNode.selectionSet.selections[0];
    let opticPlan = processView(queryField);
    if (!opticPlan) {
        return null;
    }
    const viewName = queryField.name.value;
    opticPlan = opticPlan.groupBy(null,
        [op.arrayAggregate(op.col(viewName), op.col(viewName), null)]);
    opticPlan = opticPlan.select(
        op.as(
            "data",
            op.jsonObject([
                op.prop(viewName, op.col(viewName))
            ])
        )
    );
    return opticPlan;
}

// In this case, a queryField is a Field with defined SelectionSet
function processView(queryField, parentViewName, fromColumnName) {
    const viewName = queryField.name.value;
    let viewNodePlan = null;

    const fieldSelectionSet = queryField.selectionSet;
    if (!fieldSelectionSet) {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }

    const schemaName = extractSchemaNameFromViewDirective(queryField.directives);
    viewNodePlan = op.fromView(schemaName, viewName);
    viewNodePlan = addWhereClausesFromArguments(viewNodePlan, queryField.arguments, viewName);

    const fieldInfo = getInformationFromFields(fieldSelectionSet, viewName);
    const aggregateColumnNames = [];
    const previousAggregateColumnNames = [];
    fieldInfo.joinViewInfos.forEach(function(currentJoinViewInfo) {
        viewNodePlan = viewNodePlan.joinLeftOuter(
            currentJoinViewInfo.foreignJoinPlan,
            op.on(op.viewCol(viewName, currentJoinViewInfo.fromColumnName), op.viewCol(currentJoinViewInfo.joinViewName, currentJoinViewInfo.toColumnName))
        );
        const groupByViewColumns = buildGroupByViewColumns(viewName, fieldInfo, previousAggregateColumnNames, currentJoinViewInfo);

        viewNodePlan = viewNodePlan.groupBy([op.viewCol(viewName, currentJoinViewInfo.fromColumnName)], groupByViewColumns);
        aggregateColumnNames.push(currentJoinViewInfo.joinViewName);
        previousAggregateColumnNames.push(op.col(currentJoinViewInfo.joinViewName));
    });

    fieldInfo.groupByColumns.forEach(function(groupByColumn) {
        viewNodePlan = viewNodePlan.groupBy(groupByColumn, fieldInfo.groupByAggregateColumns);
        aggregateColumnNames.push(groupByColumn);
    });
    fieldInfo.groupByAggregateColumnNames.forEach(function(aggregateColumnName) {
        aggregateColumnNames.push(aggregateColumnName);
    });

    const jsonColumns = buildJsonColumnsList(fieldInfo, aggregateColumnNames);
    const toColumnName = fieldSelectionSet.selections[0].name.value;
    const selectColumnArray = (
        fromColumnName ?
            [ op.viewCol(viewName, toColumnName), op.as(viewName, op.jsonObject(jsonColumns)) ] :
            op.as(viewName, op.jsonObject(jsonColumns))
    );
    viewNodePlan = viewNodePlan.select(selectColumnArray);

    return viewNodePlan;
}

function buildJsonColumnsList(fieldInfo, aggregateColumnNames) {
    const jsonColumns = [];
    fieldInfo.nonJoinColumnNameStrings.forEach(function(columnName) {
        jsonColumns.push(op.prop(columnName, op.col(columnName)));
    });
    aggregateColumnNames.forEach(function(columnName) {
        jsonColumns.push(op.prop(columnName, op.col(columnName)));
    });
    return jsonColumns;
}

function buildGroupByViewColumns(viewName, fieldInfo, previousAggregateColumnNames, currentJoinViewInfo) {
    const groupByViewColumns = [];
    fieldInfo.includeInGroupBy.forEach(function(includeInGroupByColumn) {
        groupByViewColumns.push(op.viewCol(viewName, includeInGroupByColumn));
    });
    fieldInfo.nonJoinColumnNameStrings.forEach(function(nonJoinColumnName) {
        if (!fieldInfo.includeInGroupBy.includes(nonJoinColumnName)) {
            if (nonJoinColumnName !== currentJoinViewInfo.fromColumnName) {
                groupByViewColumns.push(op.viewCol(viewName, nonJoinColumnName));
            }
        }
    });
    previousAggregateColumnNames.forEach(function(columnName) {
        groupByViewColumns.push(op.col(columnName));
    });
    groupByViewColumns.push(op.arrayAggregate(currentJoinViewInfo.joinViewName, op.col(currentJoinViewInfo.joinViewName)));
    return groupByViewColumns;
}

function extractSchemaNameFromViewDirective(directives) {
    let schemaName = null;
    directives.forEach( function(directive) {
        if (directive.name.value === "Schema") {
            directive.arguments.forEach( function(argument) {
                if (argument.name.value === "name") {
                    schemaName = argument.value.value;
                }
            });
        }
    });
    return schemaName;
}

function addWhereClausesFromArguments(opticPlan, fieldArguments, viewName) {
    fieldArguments.forEach(function(argument) {
        const argumentName = argument.name.value;
        const argumentValue = argument.value.value;
        opticPlan = opticPlan.where(op.eq(op.viewCol(viewName, argumentName), argumentValue));
    });
    return opticPlan;
}

function getInformationFromFields(fieldSelectionSet, viewName) {
    const nonJoinColumnNameStrings = [];
    const includeInGroupBy = [];
    const joinViewInfos = [];
    const groupByColumns = [];
    const groupByAggregateColumns = [];
    const groupByAggregateColumnNames = [];

    // Get field information
    fieldSelectionSet.selections.forEach(function(selection) {
        const columnName = selection.name.value;
        const foreignSelectionSet = selection.selectionSet;
        // If the field is a join, drill down.
        if (foreignSelectionSet) {
            const keyNames = getKeyNames(foreignSelectionSet);
            let fromColumnName = keyNames.parentJoinColumn;
            const foreignJoinPlan = processView(selection, viewName, fromColumnName);
            const joinViewInfo = {
                "foreignJoinPlan" : foreignJoinPlan,
                "fromColumnName" : fromColumnName,
                "toColumnName" : keyNames.childJoinColumn,
                "joinViewName" : columnName
            };
            joinViewInfos.push(joinViewInfo);
        } else {
            let includeThisFieldInResults = true;
            let aggregateDirectiveFound = false;
            selection.directives.forEach(function(directive) {
                if (directive.name.value === "childJoinColumn") {
                    includeInGroupBy.push(columnName);
                    includeThisFieldInResults = false;
                }
                if (directive.name.value === "parentJoinColumn") {
                    includeThisFieldInResults = false;
                }
                if (directive.name.value === "GroupBy") {
                    includeThisFieldInResults = false;
                    aggregateDirectiveFound = true;
                    groupByColumns.push(columnName);
                }
                if (directive.name.value === "Count") {
                    includeThisFieldInResults = false;
                    aggregateDirectiveFound = true;
                    groupByAggregateColumns.push(op.count(columnName+"_count", columnName));
                    groupByAggregateColumnNames.push(columnName+"_count");
                }
                if (directive.name.value === "Sum") {
                    includeThisFieldInResults = false;
                    aggregateDirectiveFound = true;
                    groupByAggregateColumns.push(op.sum(columnName+"_sum", columnName));
                    groupByAggregateColumnNames.push(columnName+"_sum");
                }
            });
            if (!aggregateDirectiveFound) {
                groupByAggregateColumns.push(op.col(columnName));
            }
            if (includeThisFieldInResults) {
                nonJoinColumnNameStrings.push(columnName);
            }
        }
    });
    return {
        "joinViewInfos" : joinViewInfos,
        "includeInGroupBy" : includeInGroupBy,
        "nonJoinColumnNameStrings" : nonJoinColumnNameStrings,
        "groupByColumns" : groupByColumns,
        "groupByAggregateColumns" : groupByAggregateColumns,
        "groupByAggregateColumnNames" : groupByAggregateColumnNames
    };
}

function getKeyNames(selectionSet) {
    let parentJoinColumn = null;
    let childJoinColumn = null;
    selectionSet.selections.forEach(function(selection) {
        if (selection.directives.length > 0) {
            selection.directives.forEach(function(directive) {
                if (directive.name.value === "parentJoinColumn") {
                    parentJoinColumn = selection.name.value;
                }
                if (directive.name.value === "childJoinColumn") {
                    childJoinColumn = selection.name.value;
                }
            });
        }
    });
    return {
        "childJoinColumn" : childJoinColumn,
        "parentJoinColumn" : parentJoinColumn
    };
}

function executeOpticPlan(opticPlan) {
    const planObj = opticPlan.export();
    fn.trace("Plan Export\n" + op.toSource(planObj), graphqlTraceEvent);

    let result = null;
    try {
        result = opticPlan.result();
    }
    catch (err) {
        errors.push(err.toString());
        return {
            "opticPlan" : opticPlan,
            "result" : null,
            "errors": errors
        };
    }
    fn.trace("Optic Plan Result\n" + result + "Optic Plan Result Finished", graphqlTraceEvent);

    const nb = new NodeBuilder();
    nb.addNode(Sequence.from(result).toArray()[0]);
    return nb.toNode();
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.executeOpticPlan = executeOpticPlan;