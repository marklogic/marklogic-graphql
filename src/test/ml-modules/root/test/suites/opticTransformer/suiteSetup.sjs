// This file would be ran multiple times, once before each test is ran
declareUpdate();

const test = require("/test/test-helper.xqy");
const tde = require("/MarkLogic/tde.xqy");
const admin = require('/MarkLogic/admin.xqy');

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
const indexLocalname = "name";
const rangespec = admin.databaseRangeElementIndex("string", "", indexLocalname, "http://marklogic.com/collation/", fn.false());

const config = admin.getConfiguration();
const dbid = xdmp.database(dbName);
const existingIndexes = admin.databaseGetRangeElementIndexes(config, xdmp.database(dbName)).toArray();
let requiredIndexExists = false;
for (let i=0; i<existingIndexes.length; i++) {
    if (fn.exists(existingIndexes[i].xpath("./db:localname[text() = '" + indexLocalname + "']", {"db":"http://marklogic.com/xdmp/database"}))) {
        requiredIndexExists = true;
        break;
    }
}
if (!requiredIndexExists) {
    admin.saveConfiguration(admin.databaseAddRangeElementIndex(config, dbid, rangespec));
}

// Create extra schemas and views

const view = require('/MarkLogic/views');

view.schemaCreate("Primary", []);
view.schemaCreate("Secondary", []);
view.create(
    "Primary",
    "Names",
    view.elementViewScope(xs.QName("human")),
    (
        view.column("uri", cts.uriReference()),
            view.column("name", cts.elementReference(xs.QName("name"), ("nullable")))
    ),
    []
);

view.create(
    "Secondary",
    "Names",
    view.elementViewScope(xs.QName("human")),
    (
        view.column("uri", cts.uriReference()),
            view.column("name", cts.elementReference(xs.QName("name"), ("nullable")))
    ),
    []
);

