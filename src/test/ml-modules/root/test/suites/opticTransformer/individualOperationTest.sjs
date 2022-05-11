"use strict";

const test = require("/test/test-helper.xqy");
const {transformASTIntoArrayObject} = require("/mlGraphqlLibOpticApi");
const {deepEqual} = require("/testHelpers");
const assertions = [];


// Check transformASTIntoArrayObject function with a simple query string
xdmp.log("Simple valid query string test");

// Given a valid query string
const simpleGraphQlQueryString = "query someQuery { books { title author } }";

// When transformASTIntoArrayObject is called for a valid query string
let arrayObject = transformASTIntoArrayObject(simpleGraphQlQueryString);

// Then an AST subtree is returned
assertions.push(

  test.assertTrue(deepEqual("query", arrayObject["queries"][0].operation),
    "The resulting array object does not match the expected results."),

  test.assertTrue(deepEqual([], arrayObject["mutations"]),
    "The resulting array object does not match the expected results."),

  test.assertTrue(deepEqual([], arrayObject["subscriptions"]),
    "The resulting array object does not match the expected results.")
);


// Check transformASTIntoArrayObject function with a multiple request string
xdmp.log("Multiple valid request string test");

// Given a valid request string
const multipleGraphQlRequestString = "query someQuery { books { title author } } " +
    "query anotherQuery { books { title author } }\n" +
    "subscription OnCommentAdded($postID: ID!) { commentAdded(postID: $postID) {id content} }\n" +
    "mutation AddNewPet ($name: String!, $petType: PetType) { addPet(name: $name, petType: $petType) { id name petType } }";

// When transformASTIntoArrayObject is called for a valid request string
arrayObject = transformASTIntoArrayObject(multipleGraphQlRequestString);

// Then an AST subtree is returned
assertions.push(

  test.assertTrue(deepEqual("query", arrayObject["queries"][0].operation),
    "The resulting array object does not match the expected results."),

  test.assertTrue(deepEqual("query", arrayObject["queries"][1].operation),
    "The resulting array object does not match the expected results."),

  test.assertTrue(deepEqual("mutation", arrayObject["mutations"][0].operation),
    "The resulting array object does not match the expected results."),

  test.assertTrue(deepEqual("subscription", arrayObject["subscriptions"][0].operation),
    "The resulting array object does not match the expected results.")
);


// Check transformASTIntoArrayObject function with an invalid  multiple request string
xdmp.log("Invalid request string test");

// Given an invalid request string
const multipleGraphQlRequestStringWithSomeInvalidRequest = "query someQuery { books { title author } } " +
    "query anotherQuery  books { title author } }\n" +
    "subscription OnCommentAdded($postID: ID!) { commentAdded(postID: $postID) {id content} }\n" +
    "mutation AddNewPet ($name: String!, $petType: PetType) { addPet(name: $name, petType: $petType) { id name petType } }";

// When transformASTIntoArrayObject is called for an invalid request string
arrayObject = transformASTIntoArrayObject(multipleGraphQlRequestStringWithSomeInvalidRequest);

// Then an AST subtree is returned
assertions.push(

  test.assertTrue(deepEqual([], arrayObject["queries"]),
    "The resulting array object does not match the expected results.")
);
assertions;
