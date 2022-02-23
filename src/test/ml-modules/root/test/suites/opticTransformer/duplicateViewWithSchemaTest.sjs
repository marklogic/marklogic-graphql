'use strict';

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const {deepEqual} = require('/testHelpers');
const op = require('/MarkLogic/optic');
const assertions = [];

const primaryNB = new NodeBuilder();
primaryNB.addNode({"data":{"Names":[{"name":"Jane"}, {"name":"Jenny"}, {"name":"Jim"}, {"name":"Joan"}, {"name":"Joe"}, {"name":"John"}]}});
const expectedPrimaryResults = primaryNB.toNode();

const secondaryNB = new NodeBuilder();
secondaryNB.addNode({"data":{"Names":[{"height":"65"}, {"height":"65"}, {"height":"65"}, {"height":"70"}, {"height":"75"}, {"height":"80"}]}});
const expectedSecondaryResults = secondaryNB.toNode();
assertions.push(
    test.assertFalse(deepEqual(expectedPrimaryResults, expectedSecondaryResults),
        "The two result sets should be different.")
);


// Given multiple views with the same name (in different schemas)
let graphQlQueryStringWithDuplicatedViewAndSchemaDirective = `query someQuery { Names @Schema(name: "Primary") { name } }`;
// When the query uses an ambiguous View and specifies a schema
let response = transformGraphqlIntoOpticPlan(graphQlQueryStringWithDuplicatedViewAndSchemaDirective);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedPrimaryResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(expectedPrimaryResults, actualResult),
        "The resulting data set does not match the expected results.")
);

// Given multiple views with the same name (in different schemas)
graphQlQueryStringWithDuplicatedViewAndSchemaDirective = `query someQuery { Names @Schema(name: "Secondary") { height } }`;
// When the query uses an ambiguous View and specifies the secondary schema
response = transformGraphqlIntoOpticPlan(graphQlQueryStringWithDuplicatedViewAndSchemaDirective);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected and different than the first
actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedPrimaryResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(expectedSecondaryResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;