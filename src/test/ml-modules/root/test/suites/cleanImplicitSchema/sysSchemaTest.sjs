"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const assertions = [];

// Given no data added to the database
// When implicit schema is created by the user
// Then test if implicit schema is not containing any sys, primary or secondary view.
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
xdmp.log("Actual Result of createdSchema =>\n" + createdSchema, "info");

assertions.push(
  test.assertFalse(createdSchemaString.includes("sys"), "Implicit schema is containing sys view"),
  test.assertFalse(createdSchemaString.includes("primary"), "Implicit schema is containing primary view"),
  test.assertFalse(createdSchemaString.includes("secondary"), "Implicit schema is containing secondary view")
);
//


assertions;