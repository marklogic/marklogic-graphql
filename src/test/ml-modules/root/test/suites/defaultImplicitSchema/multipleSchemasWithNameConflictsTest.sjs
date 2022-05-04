"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const assertions = [];

// Given multiple schemas with same, conflicting, view names
// When implicit schema is created by the user
// Then test if implicit schema is containing information from both view sets.
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
xdmp.log("Actual Result of createdSchema =>\n" + createdSchema, "info");

let graphqlSchemaTypes = ["graphql_Cars", "graphqlConflict_Cars"];
graphqlSchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes(type), "Implicit schema is not containing desired " + type + " type")
  );
});

assertions;