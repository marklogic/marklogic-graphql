"use strict";

// An internal GraphQL-JS module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = {env: {NODE_ENV: "development"}};

// eslint-disable-next-line no-unused-vars
const {parse} = require("/graphql/language/parser");
const op = require("/MarkLogic/optic.sjs");
const admin = require("/MarkLogic/admin.xqy");

let errors = [];

function transformGraphqlIntoOpticPlan(graphQlQueryStr) {
  return graphQlQueryStr;
}

function executeOpticPlan(opticPlan) {
  return opticPlan;
}

function transformGraphqlIntoASTPlan(graphQlQueryStr) {
  let queryDocumentAst = null;
  errors = [];

  try {
    queryDocumentAst = parse(graphQlQueryStr);
  } catch (error) {
    const errorMessage =
        "Error parsing the GraphQL Request string: \n" + graphQlQueryStr;
    xdmp.log(errorMessage, "error");
    errors.push(errorMessage);
  }

  return buildASTObject(queryDocumentAst, graphQlQueryStr, errors);
}

function buildASTObject(queryDocumentAst, graphQlQueryStr, errors) {
  return {
    "queryDocumentAst": queryDocumentAst,
    "graphQlQueryStr": graphQlQueryStr,
    "errors": errors
  };
}

function getAllViewsNotInSysSchema() {
  const sqlQuery = "select table, name, type, schema from sys_columns";
  let viewImplicitTypes = null;

  viewImplicitTypes = op.fromSQL(sqlQuery);
  viewImplicitTypes = viewImplicitTypes.where(op.not(op.eq(op.col("schema"), "sys")));
  const result = viewImplicitTypes.result();

  return result.toArray();
}

function createMapDataTypes () {

  const mapDataTypes = new Map();

  mapDataTypes.set("integer", "Int");
  mapDataTypes.set("long", "Int");
  mapDataTypes.set("float", "Float");
  mapDataTypes.set("string", "String");
  mapDataTypes.set("boolean", "Boolean");
  mapDataTypes.set("id", "ID");

  return mapDataTypes;
}

function createAllTypesArray () {

  const mapDataTypes = createMapDataTypes();
  const allViews = getAllViewsNotInSysSchema();

  let allTypes = [];

  for (let i = 0; i < Object.keys(allViews).length; i++) {
    let type = {};
    type.typeName = allViews[i]["sys.sys_columns.schema"] + "_" + allViews[i]["sys.sys_columns.table"];
    type.fields = allViews[i]["sys.sys_columns.name"] + ": " + mapDataTypes.get(allViews[i]["sys.sys_columns.type"]);

    allTypes.push(type);
  }

  let output = [];

  allTypes.forEach(item => {
    const existing = output.filter(function(v) {
      return v.typeName === item.typeName;
    });
    if (existing.length) {
      let existingIndex = output.indexOf(existing[0]);
      output[existingIndex].fields = output[existingIndex].fields.concat(item.fields);
    } else {
      if (typeof item.fields === "string") { item.fields = [item.fields]; }
      output.push(item);
    }
  });

  return output;
}

function typeDefinition(typesArray) {
  let schema = ``;

  typesArray.forEach(function(item) {
    const singularTypeName = item.typeName.slice(0, -1);
    schema += `type ${singularTypeName} {\n`;

    item.fields.forEach(function(field) {
      schema += `  ${field}\n`;

    });
    schema += `}\n\n`;
  });

  return schema;
}

function queryDefinition(typesArray) {

  let schema = `type Query {\n`;

  typesArray.forEach(item => {
    const singularTypeName = item.typeName.slice(0, -1);
    schema += `  ${item.typeName}: [${singularTypeName}]\n`;
  });

  schema += `}\n`;

  return schema;
}

function createImplicitSchema () {

  const typesArray = createAllTypesArray();

  let schema = typeDefinition(typesArray);
  schema += queryDefinition(typesArray);

  return schema;
}

function storeImplicitSchema () {

  let result = createImplicitSchema();

  const config = admin.getConfiguration();
  const schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());

  const javascriptString = `declareUpdate(); var textNode = new NodeBuilder(); 
       textNode.addText(${JSON.stringify(result)}); textNode = textNode.toNode(); 
       xdmp.documentInsert('/graphql/implicitSchema.sdl',textNode);`;

  xdmp.eval(javascriptString,  null,
    {
      "database": schemaDatabaseId
    });
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.transformGraphqlIntoASTPlan = transformGraphqlIntoASTPlan;
exports.executeOpticPlan = executeOpticPlan;
exports.createImplicitSchema = createImplicitSchema;
exports.storeImplicitSchema = storeImplicitSchema;
exports.createMapDataTypes = createMapDataTypes;