// This file would be ran multiple times, once before each test is ran
declareUpdate();

const test = require("/test/test-helper.xqy");

var tde = require("/MarkLogic/tde.xqy");
// Load the TDE template
var template = xdmp.toJSON(
    {
        "template":{
            "context":"/humans/human",
            "rows":[
                {
                    "schemaName":"graphql",
                    "viewName":"Humans",
                    "columns":[
                        {
                            "name":"id",
                            "scalarType":"integer",
                            "val":"id"
                        },
                        {
                            "name":"name",
                            "scalarType":"string",
                            "val":"name",
                            "nullable": true
                        },
                        {
                            "name":"height",
                            "scalarType":"long",
                            "val":"height",
                            "nullable": true
                        }
                    ]
                }
            ]
        }
    }
);
tde.templateInsert("/templates/humans-TDE.tdej", template);

var template = xdmp.toJSON(
    {
        "template":{
            "context":"/cars/car",
            "rows":[
                {
                    "schemaName":"graphql",
                    "viewName":"Cars",
                    "columns":[
                        {
                            "name":"id",
                            "scalarType":"integer",
                            "val":"id"
                        },
                        {
                            "name":"ownerId",
                            "scalarType":"integer",
                            "val":"ownerId"
                        },
                        {
                            "name":"model",
                            "scalarType":"string",
                            "val":"model",
                            "nullable": true
                        },
                        {
                            "name":"year",
                            "scalarType":"string",
                            "val":"year",
                            "nullable": true
                        }
                    ]
                }
            ]
        }
    }
);
tde.templateInsert("/templates/cars-TDE.tdej", template);

var template = xdmp.toJSON(
    {
        "template":{
            "context":"/laptops/laptop",
            "rows":[
                {
                    "schemaName":"graphql",
                    "viewName":"Laptops",
                    "columns":[
                        {
                            "name":"id",
                            "scalarType":"integer",
                            "val":"id"
                        },
                        {
                            "name":"ownerId",
                            "scalarType":"integer",
                            "val":"ownerId"
                        },
                        {
                            "name":"model",
                            "scalarType":"string",
                            "val":"model",
                            "nullable": true
                        },
                        {
                            "name":"screenSize",
                            "scalarType":"string",
                            "val":"screenSize",
                            "nullable": true
                        },
                        {
                            "name":"year",
                            "scalarType":"string",
                            "val":"year",
                            "nullable": true
                        }
                    ]
                }
            ]
        }
    }
);
tde.templateInsert("/templates/laptops-TDE.tdej", template);

test.loadTestFile("humans.xml", xdmp.database(), "/humans.xml");
test.loadTestFile("cars.xml", xdmp.database(), "/cars.xml");
test.loadTestFile("laptops.xml", xdmp.database(), "/laptops.xml");