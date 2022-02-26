'use strict';

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const {deepEqual} = require('/testHelpers');
const op = require('/MarkLogic/optic');


// Test #1
const nb = new NodeBuilder();
nb.addNode({"data":{"Humans":[{"hair":"Black"}, {"hair":"Blond"}, {"hair":"Brown"}]}});
const expectedResults = nb.toNode();
const assertions = [];

// Given a simple query with a single Field that also has the @GroupBy directive
let countGraphQlQueryString = `query someQuery { Humans { hair @GroupBy } }`;
// When the parse and execute are called
let response = transformGraphqlIntoOpticPlan(countGraphQlQueryString);
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// Then the result set of the Optic query is what is expected.
let actualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + JSON.stringify(actualResult));
assertions.push(
    test.assertTrue(deepEqual(expectedResults, actualResult),
        "The resulting data set does not match the expected results.")
);

assertions;