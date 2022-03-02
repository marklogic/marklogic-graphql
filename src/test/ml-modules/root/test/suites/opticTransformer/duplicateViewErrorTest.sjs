"use strict";

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");

const expectedResultsStartWith = "SQL-AMBIGUOUSTABLE";
const assertions = [];

// Given a query with a view that exists in multiple schemas
let graphQlQueryStringWithDuplicatedView = "query someQuery { Names { name } }";
// When the query does not specify a schema
let response = transformGraphqlIntoOpticPlan(graphQlQueryStringWithDuplicatedView);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the response is an error message
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result should start with =>\n" + expectedResultsStartWith);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(actualResult.errors[0].startsWith(expectedResultsStartWith),
        "The resulting response did not start with the expected error message.")
);

assertions;