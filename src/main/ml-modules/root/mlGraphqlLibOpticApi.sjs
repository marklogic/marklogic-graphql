"use strict";

// An internal GraphQL-JS module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = { env: { NODE_ENV: "development"} };

// eslint-disable-next-line no-unused-vars
const { parse } = require("/graphql/language/parser");

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
  return graphQlQueryStr;
}

function executeOpticPlan(opticPlan) {
  return opticPlan;
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.executeOpticPlan = executeOpticPlan;