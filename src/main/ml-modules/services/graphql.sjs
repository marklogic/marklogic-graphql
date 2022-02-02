//const {callGraphQlParse} = require('/mlGraphqlLib');
const {callGraphQlParse} = require('/mlGraphqlLibOpticApi');

function get(context, params) {
    return Sequence.from([]);
};

function post(context, params, graphQlQueryStr) {
    fn.trace('graphQlQueryStr=>\n' + graphQlQueryStr, "GRAPHQL");

    if (context.inputTypes[0] === "application/graphql") {
        const parseResult = callGraphQlParse(graphQlQueryStr.toString());

        context.outputTypes = [];
        context.outputTypes.push('application/json');
        context.outputStatus = [201, 'Parsing incomplete'];
        return parseResult;
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
