"use strict";

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const op = require("/MarkLogic/optic");

const assertions = [];


// Test #1, @GroupBy
const nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black"}, {"hair":"Blond"}, {"hair":"Brown"}]}});
const expectedResults = nb.toNode();

// Given a simple query with a single Field that also has the @GroupBy directive
let countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy } }";
// When the parse and execute are called
let response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #2, @GroupBy and @Count
const nb2 = new NodeBuilder();
nb2.addNode({"data":{"Humans":[{"hair":"Black", "name_count":2}, {"hair":"Blond", "name_count":1}, {"hair":"Brown", "name_count":3}]}});
const expectedResults2 = nb2.toNode();

// Given a query with a single Field that also has the @GroupBy directive
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults2);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(expectedResults2, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #3, @GroupBy and @Count and NonAggregate
const nb3 = new NodeBuilder();
nb3.addNode({"data":{"Humans":[{"weight":100, "hair":"Black", "name_count":2}, {"weight":169, "hair":"Blond", "name_count":1}, {"weight":196, "hair":"Brown", "name_count":3}]}});
const expectedResults3 = nb3.toNode();

// Given a query with a single Field that also has the @GroupBy directive
countGraphQlQueryString = "query someQuery { Humans { hair @GroupBy name @Count weight } }";
// When the parse and execute are called
response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults3);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    // TODO - the weight column in the result is non-deterministic. Need to check the result differently.
    test.assertTrue(deepEqual(expectedResults3, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;