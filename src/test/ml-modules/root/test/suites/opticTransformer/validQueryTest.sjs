"use strict";

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoASTPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Check transformGraphqlIntoASTResult function with an invalid mutation string
xdmp.log("Valid query string test");

// Given a valid query string
const simpleGraphQlQueryString = "query someQuery { books { title author } }";

// When parse is called for a valid query string
let transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlQueryString);

xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);

// Then an AST document is returned
assertions.push(
  test.assertTrue(true, transformGraphqlIntoASTResult.queryDocumentAst.kind),

  test.assertTrue(deepEqual([], transformGraphqlIntoASTResult["errors"]),
    "The resulting AST object does not match the expected results.")
);


// Check transformGraphqlIntoASTResult function with an invalid query string
xdmp.log("Invalid query string test");

// Given an invalid query string
const simpleGraphQlInvalidQueryString = "query someQuery  books { title author } }";

// When parse is called for an invalid query string
transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlInvalidQueryString);

// Then an error is returned
xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlInvalidQueryString);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);
assertions.push(
  test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlInvalidQueryString], transformGraphqlIntoASTResult["errors"]),
  "The resulting AST object does not match the expected results.")
);


// Check transformGraphqlIntoASTResult function with a valid mutation string
xdmp.log("Valid mutation sting test");

// Given a valid mutation string
const simpleGraphQlWithArgumentMutationString = "mutation AddNewPet ($name: String!, $petType: PetType) " +
    "{ addPet(name: $name, petType: $petType) { id name petType } }";

// When parse is called for a valid Mutation string
transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentMutationString);

// Then an AST document is returned
xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);
assertions.push(
  test.assertTrue(true, transformGraphqlIntoASTResult.queryDocumentAst.kind),

  test.assertTrue(deepEqual([], transformGraphqlIntoASTResult["errors"]),
    "The resulting AST object does not match the expected results.")
);


// Check transformGraphqlIntoASTResult function with an invalid mutation string
xdmp.log("Invalid mutation sting test");

// Given an invalid mutation string
const simpleGraphQlInvalidMutationString = "mutation AddNewPet ($name: String!, $petType: PetType) " +
    "{ addPet(name: $name, petType: $petType) { id name petType } ";

// When parse is called for an invalid Mutation string
transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlInvalidMutationString);

// Then an error is returned
xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlInvalidMutationString);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);
assertions.push(
  test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlInvalidMutationString], transformGraphqlIntoASTResult["errors"]),
  "The resulting AST object does not match the expected results.")
);


// Check transformGraphqlIntoASTResult function with a valid subscription string
xdmp.log("Valid subscription string test");

// Given a valid subscription string
const simpleGraphQlWithArgumentSubscriptionString = "subscription OnCommentAdded($postID: ID!) " +
    "{ commentAdded(postID: $postID) {id content} }";

// When parse is called for a valid Subscription string
transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentSubscriptionString);

xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);
assertions.push(
  test.assertTrue(true, transformGraphqlIntoASTResult.queryDocumentAst.kind),

  test.assertTrue(deepEqual([], transformGraphqlIntoASTResult["errors"]),
    "The resulting AST object does not match the expected results.")
);


// Check transformGraphqlIntoASTResult function with an invalid subscription string
xdmp.log("Invalid subscription string test");

// Given an invalid subscription string
const simpleGraphQlInvalidSubscriptionString = "subscription OnCommentAdded($postID: ID!) " +
    "{ commentAdded(postID: $postID) {id content} ";

// When parse is called for an invalid Subscription string
transformGraphqlIntoASTResult = transformGraphqlIntoASTPlan(simpleGraphQlInvalidSubscriptionString);

// Then an error is returned
xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request" +
    " string: \n" +
    simpleGraphQlInvalidSubscriptionString);
xdmp.log("Actual Result=>\n" + transformGraphqlIntoASTResult["errors"]);
assertions.push(
  test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlInvalidSubscriptionString], transformGraphqlIntoASTResult["errors"]),
  "The resulting AST object does not match the expected results.")
);
assertions;
