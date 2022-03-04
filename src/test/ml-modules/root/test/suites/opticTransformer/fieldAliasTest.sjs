"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with field aliases as well as an alias for the view
const simpleGraphQlWithArgumentQueryString = "query someQuery { H: Humans { nm: name ht: height } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"H":[{"nm":"John", "ht":70}, {"nm":"Jane", "ht":65}, {"nm":"Jenny", "ht":65}, {"nm":"Jim", "ht":75}, {"nm":"Joe", "ht":80}, {"nm":"Joan", "ht":65}]}})
    .toNode();

// When parse and execute are called
const response = transformGraphqlIntoOpticPlan(simpleGraphQlWithArgumentQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
const actualResult = executeOpticPlan(response.opticPlan);

// Then the fields and view have the alias names not the original names.
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;