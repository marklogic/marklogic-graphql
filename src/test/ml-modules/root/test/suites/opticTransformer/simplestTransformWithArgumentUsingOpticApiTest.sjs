"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with a query with an argument on the primary view
const simpleGraphQlWithArgumentQueryString = "query someQuery { Humans (id: \"1000\") { name height } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"name":"Jane", "height":65}]}})
    .toNode();

// When parse and execute are called
const response = transformGraphqlIntoOpticPlan(simpleGraphQlWithArgumentQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
let actualResult = executeOpticPlan(response.opticPlan);

// Then the result set of the Optic query is what is expected.
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;