"use strict";

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan} = require("/mlGraphqlLibOpticApi");
const assertions = [];

// This is a sample test using the Given-When-Then format for scenarios.
// NOTE - this will begin failing when the transformation is acutally implemented.

// Given a GraphQL query in a string
const graphQlQuery = "query { Humans { name height } }";

// When the transform is called
const response = transformGraphqlIntoOpticPlan(graphQlQuery);

// Then the response is the same as the original string
assertions.push(
  test.assertEqual(graphQlQuery, response, "The transform response does not match the original request.")
);

assertions;