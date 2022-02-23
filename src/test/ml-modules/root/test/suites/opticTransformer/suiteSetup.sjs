// This file would be ran multiple times, once before each test is ran
declareUpdate();

const test = require("/test/test-helper.xqy");
const tde = require("/MarkLogic/tde.xqy");
const admin = require('/MarkLogic/admin.xqy');
const view = require('/MarkLogic/views');

// Load the TDE templates
var template = xdmp.toJSON(test.getTestFile("humans-TDE.tdej"));
tde.templateInsert("/templates/humans-TDE.tdej", template);

var template = xdmp.toJSON(test.getTestFile("cars-TDE.tdej"));
tde.templateInsert("/templates/cars-TDE.tdej", template);

var template = xdmp.toJSON(test.getTestFile("laptops-TDE.tdej"));
tde.templateInsert("/templates/laptops-TDE.tdej", template);

var template = xdmp.toJSON(test.getTestFile("houses-TDE.tdej"));
tde.templateInsert("/templates/houses-TDE.tdej", template);

var template = xdmp.toJSON(test.getTestFile("rooms-TDE.tdej"));
tde.templateInsert("/templates/rooms-TDE.tdej", template);

// Load the test data
test.loadTestFile("humans.xml", xdmp.database(), "/humans.xml");
test.loadTestFile("cars.xml", xdmp.database(), "/cars.xml");
test.loadTestFile("laptops.xml", xdmp.database(), "/laptops.xml");
test.loadTestFile("houses.xml", xdmp.database(), "/houses.xml");
test.loadTestFile("rooms.xml", xdmp.database(), "/rooms.xml");

// Create a range index for the extra views
const dbName = "graphqlEndpoint-test-content";
const nameLocalname = "name";
const heightLocalname = "height";
const nameRangeSpec = admin.databaseRangeElementIndex("string", "", nameLocalname, "http://marklogic.com/collation/", fn.false());
const heightRangeSpec = admin.databaseRangeElementIndex("string", "", heightLocalname, "http://marklogic.com/collation/", fn.false());

const config = admin.getConfiguration();
const dbid = xdmp.database(dbName);
const existingIndexes = admin.databaseGetRangeElementIndexes(config, xdmp.database(dbName)).toArray();

let requiredIndexExists = false;
for (let i=0; i<existingIndexes.length; i++) {
    if (fn.exists(existingIndexes[i].xpath("./db:localname[text() = '" + nameLocalname + "']", {"db":"http://marklogic.com/xdmp/database"}))) {
        requiredIndexExists = true;
        break;
    }
}
if (!requiredIndexExists) {
    admin.saveConfiguration(admin.databaseAddRangeElementIndex(config, dbid, nameRangeSpec));
}

requiredIndexExists = false;
for (let i=0; i<existingIndexes.length; i++) {
    if (fn.exists(existingIndexes[i].xpath("./db:localname[text() = '" + heightLocalname + "']", {"db":"http://marklogic.com/xdmp/database"}))) {
        requiredIndexExists = true;
        break;
    }
}
if (!requiredIndexExists) {
    admin.saveConfiguration(admin.databaseAddRangeElementIndex(config, dbid, heightRangeSpec));
}

// Create extra schemas and views
const schemas = view.schemas().toArray();
let primaryExists = false;
let secondaryExists = false;
schemas.forEach( function(schema) {
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'primary']", {"view":"http://marklogic.com/xdmp/view"}))) {
        primaryExists = true;
    }
    if (fn.exists(schema.xpath("./view:schema-name[text() = 'secondary']", {"view":"http://marklogic.com/xdmp/view"}))) {
        secondaryExists = true;
    }
})
if (!primaryExists) {
    view.schemaCreate("primary", []);
}
if (!secondaryExists) {
    view.schemaCreate("secondary", []);
}

let views = view.views("primary").toArray();
let viewExists = false;
views.forEach( function(view) {
    if (fn.exists(view.xpath("./view:view-name[text() = 'names']", {"view":"http://marklogic.com/xdmp/view"}))) {
        viewExists = true;
    }
})
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
views.forEach( function(view) {
    if (fn.exists(view.xpath("./view:view-name[text() = 'names']", {"view":"http://marklogic.com/xdmp/view"}))) {
        viewExists = true;
    }
})
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