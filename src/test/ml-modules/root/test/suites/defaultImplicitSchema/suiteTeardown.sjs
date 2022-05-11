// This file would be ran once, after all tests in the suite have ran
"use strict";
/* global declareUpdate */ // For ESLint

const view = require("/MarkLogic/views");

declareUpdate();

function deleteDocumentInOtherDatabaseFunction(uri) {
  return {
    setUri: function setUri(_uri) { uri = _uri; },
    delete: function docDelete() {
      declareUpdate();
      if (fn.exists(fn.doc(uri))) {
        xdmp.documentDelete(uri);
      }
    }
  };
}

const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];
// Delete the TDE templates from the schemas database
dataFiles.forEach(template => {
  const testInvoke = deleteDocumentInOtherDatabaseFunction(`/templates/${template}-TDE.tdej`);
  xdmp.invokeFunction(
    testInvoke.delete,
    {database: xdmp.schemaDatabase()}
  );

  const document = `/${template}.xml`;
  xdmp.documentDelete(document);
});

const testInvoke = deleteDocumentInOtherDatabaseFunction("/graphql/implicitSchema.sdl");
xdmp.invokeFunction(
  testInvoke.delete,
  {database: xdmp.schemaDatabase()}
);

removeSchemasIfTheyExist();

function removeSchemasIfTheyExist() {
  const schemas = view.schemas().toArray();
  schemas.forEach(schema => {
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'primary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      view.remove("primary", "Names");
    }
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'secondary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      view.remove("secondary", "Names");
    }
  });
}