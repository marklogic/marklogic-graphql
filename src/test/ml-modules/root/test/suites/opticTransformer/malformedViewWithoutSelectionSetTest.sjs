"use strict";

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoOpticPlan} = require("/mlGraphqlLibOpticApi");
const assertions = [];


// Given a query without the Fields braces
const simpleGraphQlQueryString = "query { Humans }";

// When the parse is called
const response = transformGraphqlIntoOpticPlan(simpleGraphQlQueryString);

// Then an error is returned
assertions.push(
    test.assertEqual(1, response.errors.length, "The GraphQL Query string should have resulted in an error."),
    test.assertEqual("Queries must contain a SelectionSet for each View.", response.errors[0],
        "The error message does not match")
);

assertions;