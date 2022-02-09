'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const {deepEqual} = require('/testHelpers');

const simpleGraphQlJoinQueryString = `query humansCarsJoin { Humans { id name height Houses { ownerId number street Rooms { houseId types } id } id } }`;
const expectedOpticPlanExport = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"join-left-outer","args":[{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Cars",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"viewCol","args":["Cars","ownerId"]},{"ns":"op","fn":"as","args":["Cars",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["ownerId",{"ns":"op","fn":"col","args":["ownerId"]}]},{"ns":"op","fn":"prop","args":["year",{"ns":"op","fn":"col","args":["year"]}]},{"ns":"op","fn":"prop","args":["model",{"ns":"op","fn":"col","args":["model"]}]}]]}]}],null]}]},[{"ns":"op","fn":"on","args":[{"ns":"op","fn":"viewCol","args":["Humans","id"]},{"ns":"op","fn":"viewCol","args":["Cars","ownerId"]}]}],null]},{"ns":"op","fn":"group-by","args":[[{"ns":"op","fn":"viewCol","args":["Humans","id"]}],[{"ns":"op","fn":"viewCol","args":["Humans","name"]},{"ns":"op","fn":"viewCol","args":["Humans","height"]},{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Cars"]},{"ns":"op","fn":"col","args":["Cars"]},null]}]]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["Humans",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["id",{"ns":"op","fn":"viewCol","args":["Humans","id"]}]},{"ns":"op","fn":"prop","args":["name",{"ns":"op","fn":"viewCol","args":["Humans","name"]}]},{"ns":"op","fn":"prop","args":["height",{"ns":"op","fn":"viewCol","args":["Humans","height"]}]},{"ns":"op","fn":"prop","args":["Cars",{"ns":"op","fn":"col","args":["Cars"]}]}]]}]}],null]},{"ns":"op","fn":"group-by","args":[null,[{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Humans"]},{"ns":"op","fn":"col","args":["Humans"]},null]}]]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["data",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["Humans",{"ns":"op","fn":"col","args":["Humans"]}]}]]}]}],null]}]}};
const rawExpectedResult = {"data":{"Humans":[{"id":1, "name":"John", "height":70, "Houses":[]}, {"id":2, "name":"Jim", "height":75, "Houses":[{"ownerId":2, "number":"415", "street":"Elm"}]}, {"id":3, "name":"Joe", "height":80, "Houses":[{"ownerId":3, "number":"656", "street":"Main"}, {"ownerId":3, "number":"653", "street":"Second"}]}, {"id":1000, "name":"Jane", "height":65, "Houses":[]}, {"id":1001, "name":"Jenny", "height":65, "Houses":[]}, {"id":1002, "name":"Joan", "height":65, "Houses":[]}]}};
const nb = new NodeBuilder();
nb.addNode(rawExpectedResult);
const expectedResults = nb.toNode();
const assertions = [];

// Given a query with the query keyword and query name
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlJoinQueryString);
// Then the returned Optic DSL is what is expected.
console.log("expectedOpticPlanExport:\n" + JSON.stringify(expectedOpticPlanExport));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
assertions.push(
    test.assertTrue(deepEqual(xdmp.toJSON(expectedOpticPlanExport),xdmp.toJSON(response.opticPlan.export())),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
)

assertions