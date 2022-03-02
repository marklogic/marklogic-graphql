"use strict";
/* global NodeBuilder, Sequence */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const op = require("/MarkLogic/optic");

const expectedOpticPlanExport = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["Humans",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["name",{"ns":"op","fn":"viewCol","args":["Humans","name"]}]},{"ns":"op","fn":"prop","args":["height",{"ns":"op","fn":"viewCol","args":["Humans","height"]}]}]]}]}],null]},{"ns":"op","fn":"group-by","args":[null,[{"ns":"op","fn":"array-aggregate","args":[{"ns":"op","fn":"col","args":["Humans"]},{"ns":"op","fn":"col","args":["Humans"]},null]}]]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"as","args":["data",{"ns":"op","fn":"json-object","args":[[{"ns":"op","fn":"prop","args":["Humans",{"ns":"op","fn":"col","args":["Humans"]}]}]]}]}],null]}]}};
const expectedResultsRaw = op.import(expectedOpticPlanExport).result();
const nb = new NodeBuilder();
nb.addNode(Sequence.from(expectedResultsRaw).toArray()[0]);
const expectedResults = nb.toNode();
const assertions = [];


// Test #1
// Given a query with the query keyword and query name
let simpleGraphQlQueryString = "query someQuery { Humans { name height } }";
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
console.log("expectedOpticPlanExport:\n" + JSON.stringify(expectedOpticPlanExport));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);



// Test #2
// Given a query without the query keyword and query name
simpleGraphQlQueryString = "{ Humans { name height } }";
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #3
// Given a query without the query name
simpleGraphQlQueryString = "query { Humans { name height } }";
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the result set of the Optic query is what is expected.
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Test #4
// Given a query with a name, without the query keyword
simpleGraphQlQueryString = "someQuery { Humans { name height } }";
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Error parsing the GraphQL Query string: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
);


// Test #4
// Given a query without Fields
simpleGraphQlQueryString = "query { Humans { } }";
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Error parsing the GraphQL Query string: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
);


// Test #5
// Given a query without the Fields braces
simpleGraphQlQueryString = "query { Humans }";
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Queries must contain a SelectionSet for each View.", response.errors[0],
        "The error message does not match")
);

assertions;