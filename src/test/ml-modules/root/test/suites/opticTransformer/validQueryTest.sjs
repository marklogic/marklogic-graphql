"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoASTPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


const simpleGraphQlWithArgumentQueryString = "query someQuery { books { title author } }";
const simpleGraphQlWithNotValidArgumentQueryString = "query someQuery  books { title author } }";

const simpleGraphQlWithArgumentMutationString = "mutation AddNewPet ($name: String!, $petType: PetType) " +
    "{ addPet(name: $name, petType: $petType) { id name petType } }";
const simpleGraphQlWithNotValidArgumentMutationString = "mutation AddNewPet ($name: String!, $petType: PetType) " +
    "{ addPet(name: $name, petType: $petType) { id name petType } ";

const simpleGraphQlWithArgumentSubscriptionString = "subscription OnCommentAdded($postID: ID!) " +
    "{ commentAdded(postID: $postID) {id content} }";
const simpleGraphQlWithNotValidArgumentSubscriptionString = "subscription OnCommentAdded($postID: ID!) " +
    "{ commentAdded(postID: $postID) {id content} ";


// When parse is called for a valid query string
let queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentQueryString);

xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid query string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentQueryString);

xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlWithNotValidArgumentQueryString);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlWithNotValidArgumentQueryString], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for a valid Mutation string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentMutationString);

xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid Mutation string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentMutationString);

xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlWithNotValidArgumentMutationString);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlWithNotValidArgumentMutationString], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for a valid Subscription string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentSubscriptionString);

xdmp.log("Expected Result=>\n" + []);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid Subscription string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentSubscriptionString);

xdmp.log("Expected Result=>\n" + "Error parsing the GraphQL Request" +
    " string: \n" +
    simpleGraphQlWithNotValidArgumentSubscriptionString);
xdmp.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual(["Error parsing the GraphQL Request string: \n" +
        simpleGraphQlWithNotValidArgumentSubscriptionString], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);
assertions;
