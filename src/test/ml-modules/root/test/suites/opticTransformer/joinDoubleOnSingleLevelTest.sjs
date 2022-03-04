"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with the query keyword and query name
const simpleGraphQlJoinQueryString = "query humansCarsJoin { Humans { id name height Houses { ownerId ownerId @childJoinColumn id @parentJoinColumn number street } Laptops { ownerId @childJoinColumn id @parentJoinColumn model screenSize } } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"id":1, "name":"John", "height":70, "Houses":[], "Laptops":[]}, {"id":2, "name":"Jim", "height":75, "Houses":[{"ownerId":2, "number":"415", "street":"Elm"}], "Laptops":[{"model":"HP", "screenSize":"15"}]}, {"id":3, "name":"Joe", "height":80, "Houses":[{"ownerId":3, "number":"656", "street":"Main"}, {"ownerId":3, "number":"653", "street":"Second"}], "Laptops":[]}, {"id":1000, "name":"Jane", "height":65, "Houses":[], "Laptops":[{"model":"Apple", "screenSize":"13"}, {"model":"HP", "screenSize":"17"}]}, {"id":1001, "name":"Jenny", "height":65, "Houses":[], "Laptops":[]}, {"id":1002, "name":"Joan", "height":65, "Houses":[], "Laptops":[]}]}})
    .toNode();

// When parse and execute are called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
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