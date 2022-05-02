"use strict";
/* global xdmp */ // For ESLint

const test = require("/test/test-helper.xqy");
const tde = require("/MarkLogic/tde.xqy");
const {createImplicitSchema, storeImplicitSchema} = require("/mlGraphqlLibOpticApi");
const admin = require("/MarkLogic/admin.xqy");
const {parse} = require("/graphql/language/parser");
const assertions = [];

// Given no data added to the database
// When implicit schema is created by the user
// Then test if implicit schema is containing both sys views, primary and secondary
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
console.log("Actual Result of createdSchema =>\n" + createdSchema);


let primarySchemaTypes = ["primary_names"];
primarySchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes(type), "Implicit schema is not containing desired " + type + " type")
  );
});

let secondarySchemaTypes = ["secondary_names"];
secondarySchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes(type), "Implicit schema is not containing desired " + type + " type")
  );
});

assertions;