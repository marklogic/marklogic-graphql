'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLibOpticApi');
const assertions = [];

const simpleGraphQlWithArgumentQueryString = `query someQuery { Humans (id: "1000") { name height } }`;
const expectedOpticQueryString = "op.fromView(null, 'Humans').where(op.eq(op.col('id'), '1000'))";
const expectedOpticAst = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"where","args":[{"ns":"op","fn":"eq","args":[{"ns":"op","fn":"col","args":["id"]},"1000"]}]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]}]}}
let opExpectedResult = op.import(expectedOpticAst).result();
const expectedResultsArray = [];
Array.from(opExpectedResult).forEach(element => expectedResultsArray.push(element));

const response = callGraphQlParse(simpleGraphQlWithArgumentQueryString);
console.log("expectedOpticQueryString:\n" + expectedOpticAst);
console.log("opticAst:\n" + JSON.stringify(response.opticAst));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
assertions.push(
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticAst),
        "The resulting Optic DSL does not match the expected Optic DSL"),
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticPlan.export()),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
let opActualResult = response.opticPlan.result();
let actualResultsArray = [];
Array.from(opActualResult).forEach(element => actualResultsArray.push(element));
assertions.push(
    test.assertEqual(expectedResultsArray, actualResultsArray,
        "The resulting data set does not match the expected results.")
)

assertions