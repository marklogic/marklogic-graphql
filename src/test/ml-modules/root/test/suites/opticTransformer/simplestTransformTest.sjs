'use strict';

const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

// Test #1
// Given a query with the query keyword and query name
let simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
//const expectedOpticQueryString = "op.fromView(null, 'Humans')";
const expectedOpticAst = `{"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]}]}}`

// When the parse is called
let response = callGraphQlParse(simpleGraphQlQueryString);
console.log("opticAst:\n" + response.opticAst);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(expectedOpticAst, response.opticAst,
        "The resulting Optic DSL does not match the expected Optic DSL")
)
// const opticRequire = "const op = require('/MarkLogic/optic'); ";
// const opExpectedResult = xdmp.eval(opticRequire + expectedOpticQueryString + `.select(['id', 'name', 'height']).result()`);
// console.log("Expected Result=>\n"+opExpectedResult);
// const opActualResult = xdmp.eval(opticRequire + response.opticDsl + `.select(['id', 'name', 'height']).result()`);
// console.log("Actual Result=>\n" + opActualResult);

// Test #2
// Given a query without the query keyword and query name
simpleGraphQlQueryString = `{ Humans { name height } }`;
// When the parse is called
response = callGraphQlParse(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(expectedOpticAst, response.opticAst,
        "The resulting Optic DSL does not match the expected Optic DSL")
)

// Test #3
// Given a query without the query name
simpleGraphQlQueryString = `query { Humans { name height } }`;
// When the parse is called
response = callGraphQlParse(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(expectedOpticAst, response.opticAst,
        "The resulting Optic DSL does not match the expected Optic DSL")
)

// Test #4
// Given a query with a name, without the query keyword
simpleGraphQlQueryString = `someQuery { Humans { name height } }`;
// When the parse is called
response = callGraphQlParse(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Error parsing the GraphQL Query string: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
)

assertions