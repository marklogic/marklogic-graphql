'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

const simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
const expectedOpticQueryString = "op.fromView(null, 'Humans')";
const actualOpticQueryString = callGraphQlParse(simpleGraphQlQueryString);
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString)
)

const opticRequire = "const op = require('/MarkLogic/optic'); ";
const opExpectedResult = xdmp.eval(opticRequire + expectedOpticQueryString + `.select(['id', 'name', 'height']).result()`);
console.log("Expected Result=>\n"+opExpectedResult);
const opActualResult = xdmp.eval(opticRequire + actualOpticQueryString + `.select(['id', 'name', 'height']).result()`);
console.log("Actual Result=>\n" + opActualResult);

assertions