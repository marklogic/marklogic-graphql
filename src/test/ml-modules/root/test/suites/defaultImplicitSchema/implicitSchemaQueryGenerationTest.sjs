"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const {parse} = require("/graphql/language/parser");
const assertions = [];


// Given default data store in the database though test setup
// When implicit schema is created by the user
// Then test if implicit schema is containing the right query attributes.
const createdSchema = createImplicitSchema();
const createdAst = parse(createdSchema);

const dataFiles = ["humans", "cars", "carsConflict", "laptops", "houses", "rooms", "drinks"];

const desiredQueryName = "Query";

let createdQueryAttributes = [];
const createdDefinitions = createdAst.definitions;
createdDefinitions.forEach((element) => {
  if (element.name.value === desiredQueryName) {
    const {fields} = element;
    fields.forEach((attribute) => {
      const createdAttributeName = attribute.name.value;
      assertions.push(
        test.assertEqual(attribute.type.kind, "ListType", "Query attribute type kind is not list.")
      );
      const createdAttributeDataType = attribute.type.type.name.value;
      createdQueryAttributes.push({
        "name": createdAttributeName,
        "dataType": createdAttributeDataType
      });
    });
  }
});
createdQueryAttributes = JSON.stringify(createdQueryAttributes);
xdmp.log(`createdQueryAttributes =>\n${createdQueryAttributes}`, "info");

let desiredQueryAttributes = [];
dataFiles.forEach((template) => {
  const tde = JSON.parse(test.getTestFile(`${template}-TDE.tdej`));
  const desiredAttributeName = `${tde.template.rows[0].schemaName}_${tde.template.rows[0].viewName}`;
  const desiredAttributeDataType = desiredAttributeName.slice(0, -1) ;

  let currentDesiredQueryAttributes = {
    "name": desiredAttributeName,
    "dataType": desiredAttributeDataType
  };
  desiredQueryAttributes.push(currentDesiredQueryAttributes);
  currentDesiredQueryAttributes = JSON.stringify(currentDesiredQueryAttributes);
  xdmp.log("currentDesiredQueryAttributes =>\n" + currentDesiredQueryAttributes, "info");

  assertions.push(
    test.assertTrue(createdQueryAttributes.includes(currentDesiredQueryAttributes), `Implicit query for ${template} schema
          is not containing desired data types.`)
  );
});

assertions;