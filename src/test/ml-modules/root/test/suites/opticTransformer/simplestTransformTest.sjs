'use strict';

const op = require('/MarkLogic/optic');
const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

// Test #1
// Given a query with the query keyword and query name
let simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
const expectedOpticQueryString = "op.fromView(null, 'Humans')";
// When the parse is called
let actualOpticQueryString = callGraphQlParse(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString,
        "The resulting Optic DSL does not match the expected Optic DSL")
)

const opticRequire = "const op = require('/MarkLogic/optic'); ";
const opExpectedResult = xdmp.eval(opticRequire + expectedOpticQueryString + `.select(['id', 'name', 'height']).result()`);
console.log("Expected Result=>\n"+opExpectedResult);
const opActualResult = xdmp.eval(opticRequire + actualOpticQueryString + `.select(['id', 'name', 'height']).result()`);
console.log("Actual Result=>\n" + opActualResult);

// Test #2
// Given a query without the query keyword and query name
simpleGraphQlQueryString = `{ Humans { name height } }`;
// When the parse is called
actualOpticQueryString = callGraphQlParse(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString,
        "The resulting Optic DSL does not match the expected Optic DSL")
)

assertions