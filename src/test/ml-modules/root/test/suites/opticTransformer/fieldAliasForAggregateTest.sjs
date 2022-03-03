"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Test #6, @GroupBy and @Count, @Sum, and @Average
const nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black", "name_count":2, "weightSum":325, "weightAvg":162.5}, {"hair":"Blond", "name_count":1, "weightSum":169, "weightAvg":169}, {"hair":"Brown", "name_count":3, "weightSum":461, "weightAvg":153.666666666667}]}});
const expectedResults = nb.toNode();

// Given a query with a @GroupBy directive 2 aggregate directives on the same column, but with aliases
const countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weightSum: weight @Sum weightAvg: weight @Average } }";

// When parse and execute are called
const response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
const actualResult = executeOpticPlan(response.opticPlan);

// Then the result set contains the expected results including the correct aliases for both aggregates.
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;