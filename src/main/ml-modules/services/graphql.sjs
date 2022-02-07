const {executeOpticPlan, transformGraphqlIntoOpticPlan} = require('/mlGraphqlLibOpticApi');

function get(context, params) {
    return Sequence.from([]);
};

function post(context, params, graphQlQueryStr) {
    fn.trace('graphQlQueryStr=>\n' + graphQlQueryStr, "GRAPHQL");

    if (context.inputTypes[0] === "application/graphql") {
        const parseResult = transformGraphqlIntoOpticPlan(graphQlQueryStr.toString());

        if (parseResult.errors.length === 0) {
            const queryResult = executeOpticPlan(parseResult.opticPlan);
            context.outputTypes = [];
            context.outputTypes.push('application/json');
            context.outputStatus = [201, 'Parsing is a work in-progress.'];
            return queryResult;
        } else {
            context.outputTypes = [];
            context.outputTypes.push('application/json');
            context.outputStatus = [500, 'Errors found while parsing the query'];
            return parseResult.errors;
        }
    } else {
        context.outputTypes = [];
        context.outputTypes.push('application/json');
        context.outputStatus = [415, 'Only GraphQL queries are processed here.'];
        return {};
    }
};

function put(context, params, input) {
    return {}
};

function deleteFunction(context, params) {
  // return at most one document node
};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
