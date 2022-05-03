// This file would be ran once, after all tests in the suite have ran
"use strict";
/* global declareUpdate */ // For ESLint

function deleteDocumentInOtherDatabaseFunction(uri) {
  return {
    setUri: function setUri(_uri) { uri = _uri; },
    delete: function docDelete() { declareUpdate(); xdmp.documentDelete(uri); }
  };
}

let testInvoke = deleteDocumentInOtherDatabaseFunction("/graphql/implicitSchema.sdl");
xdmp.invokeFunction(
  testInvoke.delete,
  {database: xdmp.schemaDatabase()}
);