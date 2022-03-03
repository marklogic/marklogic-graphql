"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];

const rawExpectedResult = {"data":{"Humans":[{"id":1000, "name":"Jane", "height":65, "Cars":[{"ownerId":1000, "model":"Sonata", "year":"2017"}, {"ownerId":1000, "model":"Camry", "year":"2015"}]}]}};
const nb = new NodeBuilder();
nb.addNode(rawExpectedResult);
const expectedResults = nb.toNode();

// Given a query with the query keyword and query name
const simpleGraphQlJoinQueryString = "query humansCarsJoin { Humans (id: \"1000\") { id name height Cars { ownerId ownerId @childJoinColumn id @parentJoinColumn model year } } }";

// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
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