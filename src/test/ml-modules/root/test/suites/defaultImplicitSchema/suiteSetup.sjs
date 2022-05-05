// This is run once for the suite.
"use strict";
/* global declareUpdate */ // For ESLint

declareUpdate();

const admin = require("/MarkLogic/admin.xqy");
const view = require("/MarkLogic/views");
const test = require("/test/test-helper.xqy");
const tde = require("/MarkLogic/tde.xqy");

const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];
// Load the TDE templates
dataFiles.forEach(function(template) {
  let templateJson = xdmp.toJSON(test.getTestFile(template + "-TDE.tdej"));
  tde.templateInsert("/templates/" + template + "-TDE.tdej", templateJson);
});
// Load the test data
dataFiles.forEach(function(template) {
  test.loadTestFile(template + ".xml", xdmp.database(), "/" + template + ".xml");
});

createIndexesIfTheyDoNotExist();
createSchemasIfTheyDoNotExist();

function createIndexesIfTheyDoNotExist() {
  const nameLocalname = "name";
  const heightLocalname = "height";
  const nameRangeSpec = admin.databaseRangeElementIndex("string", "", nameLocalname, "http://marklogic.com/collation/", fn.false());
  const heightRangeSpec = admin.databaseRangeElementIndex("string", "", heightLocalname, "http://marklogic.com/collation/", fn.false());

  const config = admin.getConfiguration();
  const dbid = xdmp.database();
  const existingIndexes = admin.databaseGetRangeElementIndexes(config, dbid).toArray();

  let requiredIndexExists = false;
  existingIndexes.forEach(function(index) {
    if (fn.exists(index.xpath("./db:localname[text() = '" + nameLocalname + "']", {"db": "http://marklogic.com/xdmp/database"}))) {
      requiredIndexExists = true;
    }
  });
  if (!requiredIndexExists) {
    admin.saveConfiguration(admin.databaseAddRangeElementIndex(config, dbid, nameRangeSpec));
  }

  requiredIndexExists = false;
  existingIndexes.forEach(function(index) {
    if (fn.exists(index.xpath("./db:localname[text() = '" + heightLocalname + "']", {"db": "http://marklogic.com/xdmp/database"}))) {
      requiredIndexExists = true;
    }
  });
  if (!requiredIndexExists) {
    admin.saveConfiguration(admin.databaseAddRangeElementIndex(config, dbid, heightRangeSpec));
  }
}

function createSchemasIfTheyDoNotExist() {
  const schemas = view.schemas().toArray();
  let primaryExists = false;
  let secondaryExists = false;
  schemas.forEach(function(schema) {
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'primary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      primaryExists = true;
    }
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'secondary']", {"view": "http://marklogic.com/xdmp/view"}))) {
      secondaryExists = true;
    }
  });
  if (!primaryExists) {
    view.schemaCreate("primary", []);
  }
  if (!secondaryExists) {
    view.schemaCreate("secondary", []);
  }
}