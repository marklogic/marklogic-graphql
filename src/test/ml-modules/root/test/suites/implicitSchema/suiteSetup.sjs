// This test would be run once, before any tests in the suite has been run
"use strict";
/* global xdmp, xs, cts */ // For ESLint

const admin = require("/MarkLogic/admin.xqy");
const view = require("/MarkLogic/views");


createIndexesIfTheyDoNotExist();
createSchemasIfTheyDoNotExist();
createViewsIfTheyDoNotExist();

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

function createViewsIfTheyDoNotExist() {
  let views = view.views("primary").toArray();
  let viewExists = false;
  views.forEach(function(view) {
    if (fn.exists(view.xpath("./view:view-name[text() = 'names']", {"view": "http://marklogic.com/xdmp/view"}))) {
      viewExists = true;
    }
  });
  if (!viewExists) {
    view.create(
      "primary",
      "Names",
      view.elementViewScope(xs.QName("human")),
      (
        view.column("uri", cts.uriReference()),
        view.column("name", cts.elementReference(xs.QName("name"), ("nullable")))
      ),
      []
    );
  }

  views = view.views("secondary").toArray();
  viewExists = false;
  views.forEach(function(view) {
    if (fn.exists(view.xpath("./view:view-name[text() = 'names']", {"view": "http://marklogic.com/xdmp/view"}))) {
      viewExists = true;
    }
  });
  if (!viewExists) {
    view.create(
      "secondary",
      "Names",
      view.elementViewScope(xs.QName("human")),
      (
        view.column("uri", cts.uriReference()),
        view.column("height", cts.elementReference(xs.QName("height"), ("nullable")))
      ),
      []
    );
  }
}