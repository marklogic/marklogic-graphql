"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema, createMapDataTypes} = require("/mlGraphqlLibOpticApi");
const {parse} = require("/graphql/language/parser");
const assertions = [];


// Given default data store in the database though test setup
// When implicit schema is created by the user
// Then test if implicit schema is containing the right data types for each argument part of each generated type.
let createdSchema = createImplicitSchema();
let createdAst = parse(createdSchema);

const mapDataTypes = createMapDataTypes();
const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];

dataFiles.forEach((template) => {
  let tde = JSON.parse(test.getTestFile(template+"-TDE.tdej"));
  let desiredSchemaName = tde.template.rows[0].schemaName;
  let desiredViewName = tde.template.rows[0].viewName;

  let createdTypeAttributes = [];
  let createdDefinitions = createdAst.definitions;
  createdDefinitions.forEach((element) => {
    if (element.name.value === desiredSchemaName + "_" + desiredViewName) {
      let fields = element.fields;
      fields.forEach((attribute) => {
        let createdAttributeName = attribute.name.value;
        let createdAttributeDataType = attribute.type.name.value;
        createdTypeAttributes.push({
          "name": createdAttributeName,
          "dataType": createdAttributeDataType
        });
      });
    }
  });
  createdTypeAttributes = JSON.stringify(createdTypeAttributes);
  xdmp.log("createdTypeAttributes for " + template + "=>\n" + createdTypeAttributes, "info");

  let desiredTypeAttributes = [];
  let columns = tde.template.rows[0].columns;
  columns.forEach((element) => {
    let desiredAttributeName = element.name;
    let desiredAttributeDataType = element.scalarType;
    desiredTypeAttributes.push({
      "name": desiredAttributeName,
      "dataType": mapDataTypes.get(desiredAttributeDataType)
    });
  });
  desiredTypeAttributes = JSON.stringify(desiredTypeAttributes);
  xdmp.log("desiredTypeAttributes " + template + "=>\n" + desiredTypeAttributes, "info");


  assertions.push(
    test.assertEqual(createdTypeAttributes, desiredTypeAttributes, "Implicit " + template +
        " schema is not containing desired data types.")
  );

});

assertions;