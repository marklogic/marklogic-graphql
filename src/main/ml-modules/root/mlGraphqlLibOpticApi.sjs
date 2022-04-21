"use strict";

// An internal GraphQL-JS module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = {env: {NODE_ENV: "development"}};

// eslint-disable-next-line no-unused-vars
const {parse} = require("/graphql/language/parser");

let errors = [];

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
  return graphQlQueryStr;
}

function executeOpticPlan(opticPlan) {
  return opticPlan;
}

function transformGraphqlIntoASTPlan(graphQlQueryStr) {
  let queryDocumentAst = null;
  errors = [];

  try {
    queryDocumentAst = parse(graphQlQueryStr);
  } catch (error) {
    const errorMessage =
        "Error parsing the GraphQL Request string: \n" + graphQlQueryStr;
    console.error(errorMessage);
    errors.push(errorMessage);
    return buildASTObject(graphQlQueryStr, errors);
  }

  return buildASTObject(queryDocumentAst, errors);
}

function buildASTObject(queryDocumentAst, errors) {
  return {
    "queryDocumentAst" : queryDocumentAst,
    "result" : null,
    "errors": errors
  };
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.transformGraphqlIntoASTPlan = transformGraphqlIntoASTPlan;
exports.executeOpticPlan = executeOpticPlan;