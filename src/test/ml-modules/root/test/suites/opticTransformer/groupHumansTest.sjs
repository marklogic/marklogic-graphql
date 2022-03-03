"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Test #2, @GroupBy and @Count
let nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black", "name_count":2}, {"hair":"Blond", "name_count":1}, {"hair":"Brown", "name_count":3}]}});
const test2ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive
let countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count } }";
// When the parse and execute are called
let response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test2ExpectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(test2ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #3, @GroupBy and @Count and NonAggregate
nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"weight":100, "hair":"Black", "name_count":2}, {"weight":169, "hair":"Blond", "name_count":1}, {"weight":196, "hair":"Brown", "name_count":3}]}});
const test3ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test3ExpectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(test3ExpectedResults, actualResult, ["weight"]),
        "The resulting data set does not match the expected results.")
);


// Test #4, @GroupBy and @Count and @Sum
nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"weight_sum":325, "hair":"Black", "name_count":2}, {"weight_sum":169, "hair":"Blond", "name_count":1}, {"weight_sum":461, "hair":"Brown", "name_count":3}]}});
const test4ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight @Sum } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test4ExpectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(test4ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #5, @GroupBy, @Count, and @Average
nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"weight_average":162.5, "hair":"Black", "name_count":2}, {"weight_average":169, "hair":"Blond", "name_count":1}, {"weight_average":153.666666666667, "hair":"Brown", "name_count":3}]}});
const test5ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive and aggregate directives
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight @Average } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test5ExpectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(test5ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;