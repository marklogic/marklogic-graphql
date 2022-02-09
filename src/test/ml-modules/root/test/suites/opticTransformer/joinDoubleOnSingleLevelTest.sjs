'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const {deepEqual} = require('/testHelpers');

const simpleGraphQlJoinQueryString = `query humansCarsJoin { Humans { id name height Houses { ownerId number street } id Laptops { ownerId model screenSize } id } }`;
const rawExpectedResult = {"data":{"Humans":[{"id":1, "name":"John", "height":70, "Houses":[], "Laptops":[]}, {"id":2, "name":"Jim", "height":75, "Houses":[{"ownerId":2, "number":"415", "street":"Elm"}], "Laptops":[{"ownerId":2, "model":"HP", "screenSize":"15"}]}, {"id":3, "name":"Joe", "height":80, "Houses":[{"ownerId":3, "number":"656", "street":"Main"}, {"ownerId":3, "number":"653", "street":"Second"}], "Laptops":[]}, {"id":1000, "name":"Jane", "height":65, "Houses":[], "Laptops":[{"ownerId":1000, "model":"Apple", "screenSize":"13"}, {"ownerId":1000, "model":"HP", "screenSize":"17"}]}, {"id":1001, "name":"Jenny", "height":65, "Houses":[], "Laptops":[]}, {"id":1002, "name":"Joan", "height":65, "Houses":[], "Laptops":[]}]}};
const nb = new NodeBuilder();
nb.addNode(rawExpectedResult);
const expectedResults = nb.toNode();
const assertions = [];

// Given a query with the query keyword and query name
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
)

assertions