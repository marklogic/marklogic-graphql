"use strict";

const test = require("/test/test-helper.xqy");
const {createImplicitSchema} = require("/mlGraphqlLibOpticApi");
const assertions = [];


// Given default data store in the database though test setup
// When implicit schema is created by the user
// Then test if implicit schema is containing the right data types for each argument part of each generated type.
let createdSchema = createImplicitSchema();

const desiredDataTypes = `type secondary_names {
  height: String
}

type primary_names {
  name: String
}

type graphqlConflict_Cars {
  id: Int
  ownerId: Int
  model: String
  year: String
}

type graphql_Humans {
  id: Int
  name: String
  height: Int
  weight: Int
  hair: String
  drinkId: Int
}

type graphql_Cars {
  id: Int
  ownerId: Int
  model: String
  year: String
}

type graphql_Laptops {
  id: Int
  ownerId: Int
  model: String
  screenSize: String
  year: String
}

type graphql_Houses {
  id: Int
  ownerId: Int
  number: String
  street: String
}

type graphql_Rooms {
  id: Int
  houseId: Int
  type: String
}

type graphql_Drinks {
  id: Int
  name: String
}`;

assertions.push(
  test.assertTrue(createdSchema.includes(desiredDataTypes), "Implicit schema is not containing desired data types.")
);

assertions;