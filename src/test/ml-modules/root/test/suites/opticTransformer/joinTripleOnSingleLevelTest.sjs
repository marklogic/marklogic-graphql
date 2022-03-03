"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];

const rawExpectedResult = {"data":{"Humans":[{"id":1, "name":"John", "height":70, "Cars":[{"ownerId":1, "model":"Accord", "year":"2013"}], "Laptops":[], "Houses":[]}, {"id":2, "name":"Jim", "height":75, "Cars":[], "Laptops":[{"ownerId":2, "model":"HP", "screenSize":"15"}], "Houses":[{"number":"415", "street":"Elm"}]}, {"id":3, "name":"Joe", "height":80, "Cars":[], "Laptops":[], "Houses":[{"number":"656", "street":"Main"}, {"number":"653", "street":"Second"}]}, {"id":1000, "name":"Jane", "height":65, "Cars":[{"ownerId":1000, "model":"Sonata", "year":"2017"}, {"ownerId":1000, "model":"Camry", "year":"2015"}], "Laptops":[{"ownerId":1000, "model":"HP", "screenSize":"17"}, {"ownerId":1000, "model":"Apple", "screenSize":"13"}], "Houses":[]}, {"id":1001, "name":"Jenny", "height":65, "Cars":[], "Laptops":[], "Houses":[]}, {"id":1002, "name":"Joan", "height":65, "Cars":[], "Laptops":[], "Houses":[]}]}};
const nb = new NodeBuilder();
nb.addNode(rawExpectedResult);
const expectedResults = nb.toNode();

// Given a query with the query keyword and query name
const graphQlTripleJoinQueryString = "query humansCarsJoin { Humans { id name height Cars { ownerId ownerId @childJoinColumn id @parentJoinColumn model year } Laptops { ownerId ownerId @childJoinColumn id @parentJoinColumn model screenSize } Houses { ownerId @childJoinColumn id @parentJoinColumn number street } } }";

// When the parse is called
let response = transformGraphqlIntoOpticPlan(graphQlTripleJoinQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());

// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;