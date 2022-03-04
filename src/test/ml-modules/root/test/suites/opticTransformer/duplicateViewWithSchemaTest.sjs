"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Given multiple views with the same name (in different schemas)
// and a query that species the first of the schemas
let graphQlQueryStringWithDuplicatedViewAndSchemaDirective = "query someQuery { Names @Schema(name: \"Primary\") { name } }";
const expectedPrimaryResults = new NodeBuilder()
    .addNode({"data":{"Names":[{"name":"Jane"}, {"name":"Jenny"}, {"name":"Jim"}, {"name":"Joan"}, {"name":"Joe"}, {"name":"John"}]}})
    .toNode();

// When the query uses an ambiguous View and specifies a schema
let response = transformGraphqlIntoOpticPlan(graphQlQueryStringWithDuplicatedViewAndSchemaDirective);
console.log("opticPlan:\n" + response.opticPlan.export());
let actualResult = executeOpticPlan(response.opticPlan);

// Then the result set of the Optic query is what is expected.
console.log("Expected Result=>\n" + expectedPrimaryResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedPrimaryResults, actualResult),
        "The resulting data set does not match the expected results.")
);


// Given multiple views with the same name (in different schemas)
// and a query that species the second of the schemas
graphQlQueryStringWithDuplicatedViewAndSchemaDirective = "query someQuery { Names @Schema(name: \"Secondary\") { height } }";
const expectedSecondaryResults = new NodeBuilder()
    .addNode({"data":{"Names":[{"height":"65"}, {"height":"65"}, {"height":"65"}, {"height":"70"}, {"height":"75"}, {"height":"80"}]}})
    .toNode();

// When the query uses an ambiguous View and specifies the secondary schema
response = transformGraphqlIntoOpticPlan(graphQlQueryStringWithDuplicatedViewAndSchemaDirective);
console.log("opticPlan:\n" + response.opticPlan.export());
actualResult = executeOpticPlan(response.opticPlan);

// Then the result set of the Optic query is what is expected and different from the first
console.log("Expected Result=>\n" + expectedSecondaryResults);
console.log("Actual Result=>\n" + actualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedSecondaryResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;