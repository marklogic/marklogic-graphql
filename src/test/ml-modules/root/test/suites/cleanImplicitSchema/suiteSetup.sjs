// This test would be run once, before any tests in the suite has been run
"use strict";
/* global declareUpdate */ // For ESLint

declareUpdate();

const admin = require("/MarkLogic/admin.xqy");

createIndexesIfTheyDoNotExist();

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