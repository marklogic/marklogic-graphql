"use strict";
/* global declareUpdate, xdmp */ // For ESLint

declareUpdate();

const test = require("/test/test-helper.xqy");
const tde = require("/MarkLogic/tde.xqy");
const {createImplicitSchema, storeImplicitSchema} = require("/mlGraphqlLibOpticApi");
const admin = require("/MarkLogic/admin.xqy");
const {parse} = require("/graphql/language/parser");
const assertions = [];

function testSetup() {
  const dataFiles = ["cars", "carsConflict"];
  // Load the TDE templates
  dataFiles.forEach(function(template) {
    let templateJson = xdmp.toJSON(test.getTestFile(template + "-TDE.tdej"));
    tde.templateInsert("/templates/" + template + "-TDE.tdej", templateJson);
  });
  // Load the test data
  dataFiles.forEach(function(template) {
    test.loadTestFile(template + ".xml", xdmp.database(), "/" + template + ".xml");
  });
}

function testTeardown() {

  function deleteDocumentInOtherDatabaseFunction(uri) {
    return {
      setUri: function setUri(_uri) { uri = _uri; },
      delete: function docDelete() { declareUpdate(); xdmp.documentDelete(uri); }
    };
  }

  const dataFiles = ["cars", "carsConflict"];
  // Delete the TDE templates from the schemas database
  dataFiles.forEach(function(template) {
    let testInvoke = deleteDocumentInOtherDatabaseFunction("/templates/" + template + "-TDE.tdej");
    xdmp.invokeFunction(
      testInvoke.delete,
      {database: xdmp.schemaDatabase()}
    );
  });
}

testSetup();

// Given multiple schemas with same, conflicting, view names
// When implicit schema is created by the user
// Then test if implicit schema is containing information from both view sets.
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
console.log("Actual Result of createdSchema =>\n" + createdSchema);

let graphqlSchemaTypes = ["graphql_Cars", "graphqlConflict_Cars"];
graphqlSchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes(type), "Implicit schema is not containing desired " + type + " type")
  );
});

testTeardown();

assertions;