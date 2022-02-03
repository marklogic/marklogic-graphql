'use strict';

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan, executeOpticPlan, deepEqual} = require('/mlGraphqlLibOpticApi');
const op = require('/MarkLogic/optic');
const assertions = [];

const expectedOpticAst = {"$optic":{"ns":"op","fn":"operators","args":[{"ns":"op","fn":"from-view","args":[null,"Humans",null,null]},{"ns":"op","fn":"select","args":[[{"ns":"op","fn":"col","args":["name"]},{"ns":"op","fn":"col","args":["height"]}],null]}]}}
let opExpectedResult = op.import(expectedOpticAst).result();
const expectedResultsRaw = {"data":{"Humans":[{"id":1000, "name":"Jane"}, {"id":1001, "name":"Jenny"}, {"id":2, "name":"Jim"}, {"id":3, "name":"Joe"}, {"id":1, "name":"John"}, {"id":1002, "name":"Joan"}]}};
const nb = new NodeBuilder();
nb.addNode(expectedResultsRaw);
const expectedResults = nb.toNode();

// Test #1
// Given a query with the query keyword and query name
let simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
// When the parse is called
let response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);
// Then the returned Optic DSL is what is expected.
console.log("expectedOpticQueryString:\n" + JSON.stringify(expectedOpticAst));
console.log("opticAst:\n" + JSON.stringify(response.opticAst));
console.log("opticPlan:\n" + JSON.stringify(response.opticPlan.export()));
// assertions.push(
//     test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticAst),
//         "The resulting Optic DSL does not match the expected Optic DSL"),
//     test.assertEqual(JSON.stringify(expectedOpticAst), JSON.stringify(response.opticPlan.export()),
//         "The resulting Optic Plan does not match the expected Optic Plan")
// )
// Then the result set of the Optic query is what is expected.
let opActualResult = executeOpticPlan(response.opticPlan);
console.log("Expected Result=>\n" + expectedResults);
console.log("Actual Result=>\n" + opActualResult);
assertions.push(
    test.assertTrue(deepEqual(expectedResults, opActualResult),
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
assertions.push(
    test.assertEqual(expectedResults, opActualResult,
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
assertions.push(
    test.assertEqual(expectedResults, opActualResult,
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