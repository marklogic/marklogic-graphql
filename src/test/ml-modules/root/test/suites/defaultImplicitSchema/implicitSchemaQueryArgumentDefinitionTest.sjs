"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema, createMapDataTypes} = require("/mlGraphqlLibOpticApi");
const {parse} = require("/graphql/language/parser");
const assertions = [];


// Given default data store in the database though test setup
// When implicit schema is created by the user
// Then test if implicit schema is containing the right query attributes with desired arguments listed.
const createdSchema = createImplicitSchema();
const createdAst = parse(createdSchema);
const mapDataTypes = createMapDataTypes();

const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];

const desiredQueryName = "Query";

let createdQueryAttributes = [];
const createdDefinitions = createdAst.definitions;
createdDefinitions.forEach((element) => {
  if (element.name.value === desiredQueryName) {
    const {fields} = element;
    fields.forEach((attribute) => {
      const createdAttributeName = attribute.name.value;
      const createdAttributeArguments = attribute.arguments;
      let createdArgumentsList = [];
      createdAttributeArguments.forEach(argument => {
        createdArgumentsList.push(
          {
            "name": argument.name.value,
            "dataType": argument.type.name.value
          }
        );
      });

      const currentCreatedQueryAttributes = {
        "name": createdAttributeName,
        "arguments": createdArgumentsList
      };

      createdQueryAttributes.push(currentCreatedQueryAttributes);
      xdmp.log(`currentCreatedQueryAttributes =>\n${JSON.stringify(currentCreatedQueryAttributes)}`, "info");

    });
  }
});
const createdQueryAttributesString = JSON.stringify(createdQueryAttributes);

let desiredQueryAttributes = [];
dataFiles.forEach((template) => {
  const tde = JSON.parse(test.getTestFile(`${template}-TDE.tdej`));
  const desiredAttributeName = `${tde.template.rows[0].schemaName}_${tde.template.rows[0].viewName}`;

  let desiredTypeAttributes = [];
  const columns = tde.template.rows[0].columns;
  columns.forEach((element) => {
    const desiredAttributeName = element.name;
    const desiredAttributeDataType = element.scalarType;
    desiredTypeAttributes.push({
      "name": desiredAttributeName,
      "dataType": mapDataTypes.get(desiredAttributeDataType)
    });
  });

  const currentDesiredQueryAttributes = {
    "name": desiredAttributeName,
    "arguments": desiredTypeAttributes
  };

  desiredQueryAttributes.push(currentDesiredQueryAttributes);
  const currentDesiredQueryAttributesString = JSON.stringify(currentDesiredQueryAttributes);
  xdmp.log(`currentDesiredQueryAttributes =>\n${currentDesiredQueryAttributesString}`, "info");

  assertions.push(
    test.assertTrue(createdQueryAttributesString.includes(currentDesiredQueryAttributesString), `Implicit ${template} schema 
        is not containing desired query arguments.`)
  );
});

assertions;