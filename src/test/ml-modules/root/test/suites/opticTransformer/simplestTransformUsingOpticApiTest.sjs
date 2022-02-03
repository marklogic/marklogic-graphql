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
let simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
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



// Test #2
// Given a query without the query keyword and query name
simpleGraphQlQueryString = `{ Humans { name height } }`;
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticAst),
        "The resulting Optic DSL does not match the expected Optic DSL"),
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticPlan.export()),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
opActualResult = executeOpticPlan(response.opticPlan);
actualResultsArray = [];
Array.from(opActualResult).forEach(element => actualResultsArray.push(element));
assertions.push(
    test.assertEqual(expectedResultsArray, actualResultsArray,
        "The resulting data set does not match the expected results.")
)


// Test #3
// Given a query without the query name
simpleGraphQlQueryString = `query { Humans { name height } }`;
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
assertions.push(
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticAst),
        "The resulting Optic DSL does not match the expected Optic DSL"),
    test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticPlan.export()),
        "The resulting Optic Plan does not match the expected Optic Plan")
)
// Then the result set of the Optic query is what is expected.
opActualResult = executeOpticPlan(response.opticPlan);
actualResultsArray = [];
Array.from(opActualResult).forEach(element => actualResultsArray.push(element));
assertions.push(
    test.assertEqual(expectedResultsArray, actualResultsArray,
        "The resulting data set does not match the expected results.")
)


// Test #4
// Given a query with a name, without the query keyword
simpleGraphQlQueryString = `someQuery { Humans { name height } }`;
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Error parsing the GraphQL Query string: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
)


// Test #4
// Given a query without Fields
simpleGraphQlQueryString = `query { Humans { } }`;
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Error parsing the GraphQL Query string: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
)


// Test #5
// Given a query without the Fields braces
simpleGraphQlQueryString = `query { Humans }`;
// When the parse is called
response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Queries must contain a SelectionSet for each View: \n" + simpleGraphQlQueryString, response.errors[0],
        "The error message does not match")
)

assertions