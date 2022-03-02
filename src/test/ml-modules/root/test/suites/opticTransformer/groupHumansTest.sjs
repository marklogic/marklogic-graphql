"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");

const assertions = [];


// Test #1, @GroupBy
let nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black"}, {"hair":"Blond"}, {"hair":"Brown"}]}});
const test1ExpectedResults = nb.toNode();

// Given a simple query with a single Field that also has the @GroupBy directive
let countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy } }";
// When the parse and execute are called
let response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test1ExpectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(test1ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #2, @GroupBy and @Count
nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black", "name_count":2}, {"hair":"Blond", "name_count":1}, {"hair":"Brown", "name_count":3}]}});
const test2ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test2ExpectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
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
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test3ExpectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
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
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test4ExpectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(test4ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


/*
// Test #5, @GroupBy and @Count, @Sum, and @Average
nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"weight_sum":325, "hair":"Black", "name_count":2}, {"weight_sum":169, "hair":"Blond", "name_count":1}, {"weight_sum":461, "hair":"Brown", "name_count":3}]}});
const test5ExpectedResults = nb.toNode();

// Given a query with a single Field that also has the @GroupBy directive and aggregate directives
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight @Sum weight @Average } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + test5ExpectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(test5ExpectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);
*/
assertions;