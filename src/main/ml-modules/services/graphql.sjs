/* global xdmp */ // For ESLint

const {executeOpticPlan, transformGraphqlIntoOpticPlan} = require("/mlGraphqlLibOpticApi");

function post(context, params, graphQlQueryStr) {
  xdmp.log("Received a request on the GraphQL custom endpoint.");

  const parseResult = transformGraphqlIntoOpticPlan(graphQlQueryStr.toString());
  executeOpticPlan(parseResult.opticPlan);
  return graphQlQueryStr;
}

exports.POST = post;