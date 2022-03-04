"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query without a name
const simpleGraphQlWithArgumentQueryString = "{ Humans { name height } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"name":"Jenny", "height":65}, {"name":"Joe", "height":80}, {"name":"John", "height":70}, {"name":"Joan", "height":65}, {"name":"Jane", "height":65}, {"name":"Jim", "height":75}]}})
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