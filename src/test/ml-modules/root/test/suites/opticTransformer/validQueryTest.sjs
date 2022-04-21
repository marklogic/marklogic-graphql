"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {transformGraphqlIntoASTPlan} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


const simpleGraphQlWithArgumentQueryString = "query someQuery { H: Humans { nm: name ht: height } }";
const simpleGraphQlWithNotValidArgumentQueryString = "query someQuery  H: Humans { nm: name ht: height } }";

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

console.log("Expected Result=>\n" + []);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid query string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentQueryString);

console.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlWithNotValidArgumentQueryString);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertFalse(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for a valid Mutation string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentMutationString);

console.log("Expected Result=>\n" + []);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid Mutation string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentMutationString);

console.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlWithNotValidArgumentMutationString);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertFalse(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for a valid Subscription string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithArgumentSubscriptionString);

console.log("Expected Result=>\n" + []);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertTrue(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);

// When parse is called for an invalid Subscription string
queryDocumentAst = transformGraphqlIntoASTPlan(simpleGraphQlWithNotValidArgumentSubscriptionString);

console.log("Expected Result=>\n" + "Error parsing the GraphQL Request string: \n" +
    simpleGraphQlWithNotValidArgumentSubscriptionString);
console.log("Actual Result=>\n" + queryDocumentAst["errors"]);
assertions.push(
    test.assertFalse(deepEqual([], queryDocumentAst["errors"]),
        "The resulting AST object does not match the expected results.")
);
assertions;
