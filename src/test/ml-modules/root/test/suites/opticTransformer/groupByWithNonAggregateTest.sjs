"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with the @GroupBy and @Count directives, and a non-aggregated field
const countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"weight":100, "hair":"Black", "name_count":2}, {"weight":169, "hair":"Blond", "name_count":1}, {"weight":196, "hair":"Brown", "name_count":3}]}})
    .toNode();

// When the parse and execute are called
let response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
let actualResult = executeOpticPlan(response.opticPlan);

// Then the result set of the Optic query is what is expected.
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult, ["weight"]),
        "The resulting data set does not match the expected results.")
);

assertions;