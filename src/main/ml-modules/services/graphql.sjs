const {callGraphQlParse} = require('/mlGraphqlLib');

function get(context, params) {
    const results = [];
    context.outputTypes = [];
    for (const pname in params) {
        if (params.hasOwnProperty(pname)) {
            results.push({name: pname, value: params[pname]});
            context.outputTypes.push('application/json');
        }
    }

    // Return a successful response status other than the default
    // using an array of the form [statusCode, statusMessage].
    // Do NOT use this to return an error response.
    context.outputStatus = [201, 'Yay'];

    // Set additional response headers using an object
    context.outputHeaders =
        {'X-My-Header1' : 42, 'X-My-Header2': 'h2val' };

    // Return a Sequence to return multiple documents
    return Sequence.from(results);
};

function post(context, params, graphQlQueryStr) {
    xdmp.log('graphQlQueryStr=>\n' + graphQlQueryStr);

    const queryDocumentAst = callGraphQlParse(graphQlQueryStr.toString());

    xdmp.log("queryDocumentAst=>\n" + queryDocumentAst);

    context.outputTypes = [];
    context.outputTypes.push('application/json');
    context.outputStatus = [201, 'Not parsing yet'];
    context.outputHeaders = {'X-My-Header1' : 42, 'X-My-Header2': 'h2val' };
    return {
        query: graphQlQueryStr.toString(),
        optic: queryDocumentAst.toString()
    }
};

function put(context, params, input) {
    xdmp.log('PUT invoked');
    return {}
};

function deleteFunction(context, params) {
  // return at most one document node
};

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
