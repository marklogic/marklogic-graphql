// This file would be ran multiple times, once before each test is ran
declareUpdate();

const test = require("/test/test-helper.xqy");
var tde = require("/MarkLogic/tde.xqy");

// Load the TDE template
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

test.loadTestFile("humans.xml", xdmp.database(), "/humans.xml");
test.loadTestFile("cars.xml", xdmp.database(), "/cars.xml");
test.loadTestFile("laptops.xml", xdmp.database(), "/laptops.xml");
test.loadTestFile("houses.xml", xdmp.database(), "/houses.xml");
test.loadTestFile("rooms.xml", xdmp.database(), "/rooms.xml");
