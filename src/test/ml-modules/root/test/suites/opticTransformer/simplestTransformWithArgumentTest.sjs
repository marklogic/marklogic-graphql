'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

const simpleGraphQlWithArgumentQueryString = `query someQuery { Humans (id: "1000") { name height } }`;
const expectedOpticQueryString = "op.fromView(null, 'Humans').where(op.eq(op.col('id'), '1000'))";
const response = callGraphQlParse(simpleGraphQlWithArgumentQueryString);
assertions.push(
    test.assertEqual(expectedOpticQueryString, response.opticDsl)
)

const opticRequire = "const op = require('/MarkLogic/optic'); ";
const opExpectedResult = xdmp.eval(opticRequire + expectedOpticQueryString + `.select(['id', 'name', 'height']).result()`);
console.log("Expected Result=>\n"+opExpectedResult);
const opActualResult = xdmp.eval(opticRequire + response.opticDsl + `.select(['id', 'name', 'height']).result()`);
console.log("Actual Result=>\n" + opActualResult);

assertions