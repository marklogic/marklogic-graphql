"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given a query with the query keyword and query name
const simpleGraphQlJoinQueryString = "query nestedJoin { Humans { id name height Houses { ownerId @childJoinColumn id @parentJoinColumn number street Rooms { houseId @childJoinColumn id @parentJoinColumn type } } } }";
const expectedResults = new NodeBuilder()
    .addNode({"data":{"Humans":[{"id":1, "name":"John", "height":70, "Houses":[]}, {"id":2, "name":"Jim", "height":75, "Houses":[{"number":"415", "street":"Elm", "Rooms":[{"type":"Kitchen"}]}]}, {"id":3, "name":"Joe", "height":80, "Houses":[{"number":"656", "street":"Main", "Rooms":[{"type":"Bedroom"}, {"type":"Dining"}]}, {"number":"653", "street":"Second", "Rooms":[{"type":"Living"}]}]}, {"id":1000, "name":"Jane", "height":65, "Houses":[]}, {"id":1001, "name":"Jenny", "height":65, "Houses":[]}, {"id":1002, "name":"Joan", "height":65, "Houses":[]}]}})
    .toNode();

// When the parse is called
const response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
console.log("opticPlan:\n" + response.opticPlan.export());
const actualResult = executeOpticPlan(response.opticPlan);

// Then the result set of the Optic query is what is expected.
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;