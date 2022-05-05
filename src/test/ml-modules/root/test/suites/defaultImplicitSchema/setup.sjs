// This is run before each test in the suite.
"use strict";
/* global declareUpdate, xs, cts */ // For ESLint

declareUpdate();

const view = require("/MarkLogic/views");

createViewsIfTheyDoNotExist();

function createViewsIfTheyDoNotExist() {
  let views = view.views("primary").toArray();
  let viewExists = false;
  views.forEach(function (view) {
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
  views.forEach(function (view) {
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