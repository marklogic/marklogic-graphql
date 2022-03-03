"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with a @GroupBy directive and 2 aggregate directives on the same column, but with aliases
const countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy personCt: name @Count totalWeight: weight @Sum averageWeight: weight @Average } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"hair":"Black", "personCt":2, "totalWeight":325, "averageWeight":162.5}, {"hair":"Blond", "personCt":1, "totalWeight":169, "averageWeight":169}, {"hair":"Brown", "personCt":3, "totalWeight":461, "averageWeight":153.666666666667}]}})
    .toNode();

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