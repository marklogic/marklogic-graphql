'use strict';

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan} = require('/mlGraphqlLibOpticApi');
const op = require('/MarkLogic/optic');
const assertions = [];

const expectedOpticAst = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]}]}}
let opExpectedResult = op.import(expectedOpticAst).result();
const expectedResultsArray = [];
Array.from(opExpectedResult).forEach(element => expectedResultsArray.push(element));

// Test #1
// Given a query with the query keyword and query name
let simpleGraphQlQueryString = `query humansCarsJoin { Humans { id name height Cars { ownerId model year } } }`;
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
console.log("expectedOpticQueryString:\n" + JSON.stringify(expectedOpticAst));
console.log("opticAst:\n" + JSON.stringify(response.opticAst));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
assertions.push(
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticAst),
        "The resulting Optic DSL does not match the expected Optic DSL"),
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticPlan.export()),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
let opActualResult = executeOpticPlan(response.opticPlan);
let actualResultsArray = [];
Array.from(opActualResult).forEach(element => actualResultsArray.push(element));
assertions.push(
    test.assertEqual(expectedResultsArray, actualResultsArray,
        "The resulting data set does not match the expected results.")
)

assertions