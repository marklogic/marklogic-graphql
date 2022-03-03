"use strict";
/* global NodeBuilder, Sequence */ // For ESLint

// An internal GraphQL-JS module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: "development"} };

const { parse } = require("/graphql/language/parser");
const op = require("/MarkLogic/optic.sjs");

const graphqlTraceEvent = "GRAPHQL";
let errors = [];

const aggMap = {
    "Count" : {
        "name" : "count",
        "func" : function (columnAlias, columnName) { return op.count(columnAlias, columnName); }
    },
    "Sum" : {
        "name" : "sum",
        "func" : function (columnAlias, columnName) { return op.sum(columnAlias, columnName); }
    },
    "Average" : {
        "name" : "average",
        "func" : function (columnAlias, columnName) { return op.avg(columnAlias, columnName); }
    }
};

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
        return buildNonResultObject(graphQlQueryStr, opticPlan, errors);
    }

    if (queryDocumentAst.kind === "Document") {
        queryDocumentAst.definitions.forEach( function(definition) {
            if (definition.operation === "query") {
                opticPlan = processQuery(definition);
                // fn.trace("transformToPlan=>\n" + JSON.stringify(opticPlan) + "\nEnd transformToPlan", graphqlTraceEvent);
            }
        });
    }
    return buildNonResultObject(graphQlQueryStr, opticPlan, errors);
}

function processQuery(operationNode) {
    fn.trace("OperationDefinition is for a query", graphqlTraceEvent);
    let queryField = operationNode.selectionSet.selections[0];
    let opticPlan = processView(queryField);
    let viewAlias;

    if (!opticPlan) {
        return null;
    }
    if (queryField.alias) {
        viewAlias = queryField.alias.value;
    } else {
        viewAlias = queryField.name.value;
    }
    opticPlan = wrapQueryPlanInJsonDataObject(opticPlan, viewAlias);
    return opticPlan;
}

function wrapQueryPlanInJsonDataObject(opticPlan, viewName) {
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
    let viewOpticPlan = null;

    const fieldSelectionSet = queryField.selectionSet;
    if (!fieldSelectionSet) {
        const errorMessage = "Queries must contain a SelectionSet for each View.";
        fn.trace(errorMessage, graphqlTraceEvent);
        errors.push(errorMessage);
        return false;
    }

    const schemaName = extractSchemaNameFromViewDirective(queryField.directives);
    viewOpticPlan = op.fromView(schemaName, viewName);
    viewOpticPlan = addWhereClausesFromArguments(viewOpticPlan, queryField.arguments, viewName);
    const fieldInfo = getInformationFromFields(fieldSelectionSet, viewName);
    viewOpticPlan = addJoinsToViewPlan(viewOpticPlan, viewName, fieldInfo);
    viewOpticPlan = addGroupByToViewPlan(viewOpticPlan, fieldInfo);

    const joinAndAggregateColumnNames = buildListOfJoinAndAggregateColumnNames(fieldInfo);
    const jsonSelectObjectColumns = buildJsonColumnsList(fieldInfo, joinAndAggregateColumnNames);
    const toColumnName = fieldSelectionSet.selections[0].name.value;
    let viewAlias = viewName;
    if (queryField.alias) {
        viewAlias = queryField.alias.value;
    }
    const selectColumnArray = (
        fromColumnName ?
            [ op.viewCol(viewName, toColumnName), op.as(viewAlias, op.jsonObject(jsonSelectObjectColumns)) ] :
            op.as(viewAlias, op.jsonObject(jsonSelectObjectColumns))
    );
    viewOpticPlan = viewOpticPlan.select(selectColumnArray);

    return viewOpticPlan;
}

function addGroupByToViewPlan(viewOpticPlan, fieldInfo) {
    let opticPlanWithGroupBys = viewOpticPlan;
    fieldInfo.groupByColumnNames.forEach(function(groupByColumnName) {
        opticPlanWithGroupBys = opticPlanWithGroupBys.groupBy(groupByColumnName, fieldInfo.groupByAggregateColumns);
    });
    return opticPlanWithGroupBys;
}

function buildListOfJoinAndAggregateColumnNames(fieldInfo) {
    const joinAndAggregateColumnNames = [];
    fieldInfo.joinViewInfos.forEach(function(currentJoinViewInfo) {
        joinAndAggregateColumnNames.push(currentJoinViewInfo.joinViewAlias);
    });
    fieldInfo.groupByColumnNames.forEach(function(groupByColumnName) {
        joinAndAggregateColumnNames.push(groupByColumnName);
    });
    fieldInfo.groupByAggregateColumnNames.forEach(function(aggregateColumnName) {
        joinAndAggregateColumnNames.push(aggregateColumnName);
    });
    return joinAndAggregateColumnNames;
}

function addJoinsToViewPlan(viewOpticPlan, currentViewName, fieldInfo) {
    const previousAggregateColumnNames = [];
    let opticPlanWithJoins = viewOpticPlan;
    fieldInfo.joinViewInfos.forEach(function(currentJoinViewInfo) {
        opticPlanWithJoins = opticPlanWithJoins.joinLeftOuter(
            currentJoinViewInfo.foreignJoinPlan,
            op.on(op.viewCol(currentViewName, currentJoinViewInfo.fromColumnName), op.viewCol(currentJoinViewInfo.joinViewName, currentJoinViewInfo.toColumnName))
        );
        const columnListForGroupByAfterJoin = buildColumnListForGroupByAfterJoin(currentViewName, fieldInfo, previousAggregateColumnNames, currentJoinViewInfo);

        opticPlanWithJoins = opticPlanWithJoins.groupBy([op.viewCol(currentViewName, currentJoinViewInfo.fromColumnName)], columnListForGroupByAfterJoin);
        previousAggregateColumnNames.push(op.col(currentJoinViewInfo.joinViewName));
    });
    return opticPlanWithJoins;
}

function buildJsonColumnsList(fieldInfo, aggregateColumnNames) {
    const jsonColumns = [];
    fieldInfo.jsonColumnAliasList.forEach(function(column) {
        jsonColumns.push(column);
    });
    aggregateColumnNames.forEach(function(columnName) {
        jsonColumns.push(op.prop(columnName, op.col(columnName)));
    });
    return jsonColumns;
}

function buildColumnListForGroupByAfterJoin(viewName, fieldInfo, previousAggregateColumnNames, currentJoinViewInfo) {
    const columns = [];
    fieldInfo.nonJoinColumnNameStrings.forEach(function(nonJoinColumnName) {
        if (nonJoinColumnName !== currentJoinViewInfo.fromColumnName) {
            columns.push(op.viewCol(viewName, nonJoinColumnName));
        }
    });
    fieldInfo.childJoinColumnNames.forEach(function(includeInGroupByColumn) {
        if (!fieldInfo.nonJoinColumnNameStrings.includes(includeInGroupByColumn)) {
            columns.push(op.viewCol(viewName, includeInGroupByColumn));
        }
    });
    previousAggregateColumnNames.forEach(function(columnName) {
        columns.push(op.col(columnName));
    });
    columns.push(op.arrayAggregate(currentJoinViewInfo.joinViewAlias, op.col(currentJoinViewInfo.joinViewAlias)));
    return columns;
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

function getJoinViewInfo(selection, viewName) {
    const columnName = selection.name.value;
    let columnAlias = columnName;
    if (selection.alias) {
        columnAlias = selection.alias.value;
    }
    const foreignSelectionSet = selection.selectionSet;
    const keyNames = getJoinColumnNames(foreignSelectionSet);
    let fromColumnName = keyNames.parentJoinColumn;
    const foreignJoinPlan = processView(selection, viewName, fromColumnName);
    return {
        "foreignJoinPlan" : foreignJoinPlan,
        "fromColumnName" : fromColumnName,
        "toColumnName" : keyNames.childJoinColumn,
        "joinViewName" : columnName,
        "joinViewAlias" : columnAlias
    };
}

function getInformationFromFields(fieldSelectionSet, viewName) {
    const nonJoinColumnNameStrings = [];
    const childJoinColumnNames = [];
    const joinViewInfos = [];               // Structure to hold info for all joins defined in this SelectionSet
    const groupByColumnNames = [];          // The column names that are used for grouping rows
    const groupByAggregateColumns = [];     // A list of op.col values for a call to op.groupBy
    const groupByAggregateColumnNames = []; // The names of columns in the op.groupBy, used in the JSON object creation for the view
    const jsonColumnAliasList = [];

    fieldSelectionSet.selections.forEach(function(selection) {
        if (selection.selectionSet) {
            const joinViewInfo = getJoinViewInfo(selection, viewName);
            joinViewInfos.push(joinViewInfo);
        } else {
            const columnName = selection.name.value;
            let columnAlias = columnName;
            if (selection.alias) {
                columnAlias = selection.alias.value;
            }
            let includeThisFieldInResults = true;
            let aggregateDirectiveFound = false;
            selection.directives.forEach(function(directive) {
                if (directive.name.value === "childJoinColumn") {
                    childJoinColumnNames.push(columnName);
                    includeThisFieldInResults = false;
                }
                if (directive.name.value === "parentJoinColumn") {
                    includeThisFieldInResults = false;
                }
                if (directive.name.value === "GroupBy") {
                    includeThisFieldInResults = false;
                    aggregateDirectiveFound = true;
                    groupByColumnNames.push(columnName);
                }
                if (aggMap[directive.name.value]) {
                    const opticFunction = aggMap[directive.name.value];
                    includeThisFieldInResults = false;
                    aggregateDirectiveFound = true;
                    let columnAlias = columnName+"_"+opticFunction.name;
                    if (selection.alias) {
                        columnAlias = selection.alias.value;
                    }
                    groupByAggregateColumns.push(opticFunction.func(columnAlias, columnName));
                    groupByAggregateColumnNames.push(columnAlias);
                }
            });

            // If the current column has an aggregate directive,
            // it is added to the list when it is found because it needs the specific op.* function
            if (!aggregateDirectiveFound) {
                groupByAggregateColumns.push(op.col(columnName));
            }

            if (includeThisFieldInResults) {
                nonJoinColumnNameStrings.push(columnName);
                jsonColumnAliasList.push(op.prop(columnAlias, op.col(columnName)));
            }
        }
    });
    return {
        "joinViewInfos" : joinViewInfos,
        "childJoinColumnNames" : childJoinColumnNames,
        "nonJoinColumnNameStrings" : nonJoinColumnNameStrings,
        "jsonColumnAliasList" : jsonColumnAliasList,
        "groupByColumnNames" : groupByColumnNames,
        "groupByAggregateColumns" : groupByAggregateColumns,
        "groupByAggregateColumnNames" : groupByAggregateColumnNames
    };
}

function getJoinColumnNames(selectionSet) {
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
        return buildNonResultObject(null, opticPlan, errors);
    }
    fn.trace("Optic Plan Result\n" + result + "Optic Plan Result Finished", graphqlTraceEvent);

    const nb = new NodeBuilder();
    nb.addNode(Sequence.from(result).toArray()[0]);
    return nb.toNode();
}

function buildNonResultObject(graphQlQueryStr, opticPlan, errors) {
    return {
        "graphqlQuery" : graphQlQueryStr,
        "opticPlan" : opticPlan,
        "result" : null,
        "errors": errors
    };
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.executeOpticPlan = executeOpticPlan;