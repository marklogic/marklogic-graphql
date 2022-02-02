'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLibOpticApi');
const assertions = [];

const simpleGraphQlWithArgumentQueryString = `query someQuery { Humans (id: "1000") { name height } }`;
const expectedOpticQueryString = "op.fromView(null, 'Humans').where(op.eq(op.col('id'), '1000'))";
const expectedOpticAst = `{"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"where","args":[{"ns":"op","fn":"eq","args":[{"ns":"op","fn":"col","args":["id"]},"1000"]}]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]}]}}`

const response = callGraphQlParse(simpleGraphQlWithArgumentQueryString);
console.log("expectedOpticQueryString:\n" + expectedOpticAst);
console.log("opticAst:\n" + JSON.stringify(response.opticAst));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan));
assertions.push(
    test.assertEqual(expectedOpticAst, JSON.stringify(response.opticAst),
        "The resulting Optic DSL does not match the expected Optic DSL"),
    test.assertEqual(expectedOpticAst, JSON.stringify(response.opticPlan),
        "The resulting Optic Plan does not match the expected Optic Plan")
)

// const opticRequire = "const op = require('/MarkLogic/optic'); ";
// const opExpectedResult = xdmp.eval(opticRequire + expectedOpticQueryString + `.select(['id', 'name', 'height']).result()`);
// console.log("Expected Result=>\n"+opExpectedResult);
// const opActualResult = xdmp.eval(opticRequire + response.opticDsl + `.select(['id', 'name', 'height']).result()`);
// console.log("Actual Result=>\n" + opActualResult);

assertions