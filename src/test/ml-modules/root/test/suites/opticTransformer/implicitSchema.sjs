"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema, storeImplicitSchema} = require("/mlGraphqlLibOpticApi");
const admin = require("/MarkLogic/admin.xqy");
const { parse } = require("/graphql/language/parser");
const op = require("/MarkLogic/optic.sjs");
const assertions = [];

// Test if implicit schema is containing desired information
let createdSchema = createImplicitSchema();
let createdSchemaString = JSON.stringify(createdSchema);
console.log("Actual Result of createdSchema =>\n" + createdSchema);

const sqlQuery = "select table, name, type, schema from sys_columns";
let viewImplicitTypes = null;

let result = null;
viewImplicitTypes = op.fromSQL(sqlQuery);
viewImplicitTypes = viewImplicitTypes.where(op.not(op.eq(op.col("schema"), "sys")));
result = viewImplicitTypes.result().toArray();
result.forEach((element) => {
  let type = (element["sys.sys_columns.schema"] + "_" + element["sys.sys_columns.table"]);
  assertions.push(
    test.assertTrue(createdSchemaString.includes(type), "Implicit schema is not containing desired " + type + " type")
  );
});

// Test is implicit schema can be parsed into AST successfully.
let queryDocumentAst = null;
let errors = [];
try {
  queryDocumentAst = JSON.stringify(parse(createdSchema));
} catch (err) {
  errors.push(err.toString());
}
assertions.push(
  test.assertNotEqual(queryDocumentAst, null, "The GraphQL implicit schema cannot be parsed into AST"),
  test.assertEqual(errors.length, 0, "The GraphQL implicit schema cannot be parsed into AST")
);


// Test if the GraphQL generated implicit schema is saved successfully in Schemas database.
storeImplicitSchema();

const config = admin.getConfiguration();
let schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());

let javascriptString = "fn.document('/graphql/implicitSchema.sdl');";

let documentSaved = xdmp.eval(javascriptString,  null,
  {
    "database" : schemaDatabaseId
  });
documentSaved = JSON.stringify(documentSaved);

console.log("Actual Result of documentSaved=>\n" + documentSaved);

assertions.push(
  test.assertEqual(createdSchemaString, documentSaved, "The GraphQL implicit schema saved should match the generated one")
);

assertions;