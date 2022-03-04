"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with a single join
const graphQlJoinQueryString = "query humansCarsJoin { Humans { id name height Cars { ownerId @childJoinColumn id @parentJoinColumn model year } } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"id":1, "name":"John", "height":70, "Cars":[{"model":"Accord", "year":"2013"}]}, {"id":2, "name":"Jim", "height":75, "Cars":[]}, {"id":3, "name":"Joe", "height":80, "Cars":[]}, {"id":1000, "name":"Jane", "height":65, "Cars":[{"model":"Sonata", "year":"2017"}, {"model":"Camry", "year":"2015"}]}, {"id":1001, "name":"Jenny", "height":65, "Cars":[]}, {"id":1002, "name":"Joan", "height":65, "Cars":[]}]}})
    .toNode();

// When parse and execute are called
let response = transformGraphqlIntoOpticPlan(graphQlJoinQueryString);
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