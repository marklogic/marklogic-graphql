"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const assertions = [];

// Given multiple schemas with same, conflicting, view names
// When implicit schema is created by the user
// Then test if implicit schema is containing information from both view sets.
const createdSchema = createImplicitSchema();
const createdSchemaString = JSON.stringify(createdSchema);
xdmp.log(`Actual Result of createdSchema =>\n${createdSchema}`, "info");

const graphqlSchemaTypes = ["graphql_Car", "graphqlConflict_Car"];
graphqlSchemaTypes.forEach((type) => {
  assertions.push(
    test.assertTrue(createdSchemaString.includes(`type ${type} {`), `Implicit schema is not containing desired ${type} type`)
  );
});

assertions;