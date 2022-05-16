// This file would be ran once, after all tests in the suite have ran
"use strict";
/* global declareUpdate */ // For ESLint
const {deleteDocumentInOtherDatabaseFunction} = require("/testHelpers");
const view = require("/MarkLogic/views");

declareUpdate();

const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];
// Delete the TDE templates from the schemas database
dataFiles.forEach(function(template) {
  let testInvoke = deleteDocumentInOtherDatabaseFunction("/templates/" + template + "-TDE.tdej");
  xdmp.invokeFunction(
    testInvoke.delete,
    {database: xdmp.schemaDatabase()}
  );

  let document = "/" + template + ".xml";
  xdmp.documentDelete(document);
});

let testInvoke = deleteDocumentInOtherDatabaseFunction("/graphql/implicitSchema.sdl");
xdmp.invokeFunction(
  testInvoke.delete,
  {database: xdmp.schemaDatabase()}
);

removeSchemasIfTheyExist();

function removeSchemasIfTheyExist() {
  const schemas = view.schemas().toArray();
  schemas.forEach(function(schema) {
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'primary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      view.remove("primary", "Names");
    }
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'secondary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      view.remove("secondary", "Names");
    }
  });
}