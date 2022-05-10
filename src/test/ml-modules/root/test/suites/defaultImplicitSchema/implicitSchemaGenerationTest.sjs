"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const {parse} = require("/graphql/language/parser");
const assertions = [];


// Given default data store in the database though test setup
// When implicit schema is created by the user
// Then test if implicit schema is containing desired information.
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
xdmp.log("Actual Result of createdSchema =>\n" + createdSchema, "info");

let graphqlSchemaTypes = ["graphql_Human", "graphql_Car", "graphql_Laptop", "graphql_House", "graphql_Room", "graphql_Drink"];
graphqlSchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes("type " + type + " {"), "Implicit schema is not containing desired " + type + " type")
  );
});

let primarySchemaTypes = ["primary_name"];
primarySchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes("type " + type + " {"), "Implicit schema is not containing desired " + type + " type")
  );
});

let secondarySchemaTypes = ["secondary_name"];
secondarySchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes("type " + type + " {"), "Implicit schema is not containing desired " + type + " type")
  );
});

let query = ["Query"];
query.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes("type " + type + " {"), "Implicit schema is not containing desired " + type + " type")
  );
});

// Given implicit schema generated by the user
// When the user stores it in the database
// Then test is implicit schema can be parsed into AST successfully.
let queryDocumentAst = null;
let errors = [];
try {
  queryDocumentAst = parse(createdSchema);
} catch (err) {
  errors.push(err.toString());
}
assertions.push(
  test.assertEqual("Document", queryDocumentAst.kind, "The GraphQL implicit schema cannot be parsed into AST"),
  test.assertEqual(errors.length, 0, "The GraphQL implicit schema cannot be parsed into AST")
);

assertions;