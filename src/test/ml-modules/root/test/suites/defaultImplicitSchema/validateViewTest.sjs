"use strict";

const test = require("/test/test-helper.xqy");
const {deepEqual} = require("/testHelpers");

const {transformASTIntoArrayObject, validateQuery} = require("/mlGraphqlLibOpticApi");
const assertions = [];

// Test #1
// Given a GQL query that matches a view in the schema
const queryWithValidView = "query someQuery { graphql_Humans { name height } }";
const validRequestAstArrays = transformASTIntoArrayObject(queryWithValidView);
const validAstQueryObject = validRequestAstArrays.queries[0];

// When the query is validated using the implicit schema
const validValidationResult = validateQuery(validAstQueryObject);

// Then no errors are returned.
assertions.push(
  test.assertTrue(deepEqual([], validValidationResult))
);


// Test #2
// Given a GQL query that matches a view in the schema
const invalidQueryName = "someQuery";
const invalidViewName = "invalidView";
const queryWithInvalidView = `query ${invalidQueryName} { ${invalidViewName} { name height } }`;
const invalidViewRequestAstArrays = transformASTIntoArrayObject(queryWithInvalidView);
const invalidAstQueryObject = invalidViewRequestAstArrays.queries[0];

// When the query is validated using the implicit schema
const invalidValidationResult = validateQuery(invalidAstQueryObject);

// Then no errors are returned.
const expectedErrorMsg = `${invalidQueryName}: View not found:${invalidViewName}`;
assertions.push(
  test.assertTrue(deepEqual([expectedErrorMsg], invalidValidationResult))
);


assertions;