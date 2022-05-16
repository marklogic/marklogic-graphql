"use strict";

// An internal GraphQL-JS module (specifically /jsutils/instanceOf.*)
// is expecting a value for process.env.NODE_ENV
this.process = {env: {NODE_ENV: "development"}};

// eslint-disable-next-line no-unused-vars
const {parse} = require("/graphql/language/parser");
const op = require("/MarkLogic/optic.sjs");
const admin = require("/MarkLogic/admin.xqy");
let errors = [];
const schemaUri = "implicit";
const queryDepthLimit = 5;

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

  let result = null;

  viewImplicitTypes = op.fromSQL(sqlQuery);
  viewImplicitTypes = viewImplicitTypes.where(op.not(op.eq(op.col("schema"), "sys")));
  result = viewImplicitTypes.result();

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
  let allViews = getAllViewsNotInSysSchema();

  let allTypes = [];

  for (let i = 0; i < Object.keys(allViews).length; i++) {
    let type = {};
    type.typeName = allViews[i]["sys.sys_columns.schema"] + "_" + allViews[i]["sys.sys_columns.table"];
    type.fields = allViews[i]["sys.sys_columns.name"] + ": " + mapDataTypes.get(allViews[i]["sys.sys_columns.type"]);

    allTypes.push(type);
  }

  let output = [];

  allTypes.forEach(function(item) {
    let existing = output.filter(function(v) {
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

function createImplicitSchema () {

  let typesArray = createAllTypesArray();

  let schema = ``;

  typesArray.forEach(function(item) {
    schema = schema + "type " + item.typeName + " {\n";

    item.fields.forEach(function(field) {
      schema = schema + "  " + field + "\n";

    });
    schema = schema + "}\n\n";
  });

  return schema;
}

function storeImplicitSchema () {

  let result = createImplicitSchema();

  const config = admin.getConfiguration();
  let schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());

  let javascriptString = "declareUpdate(); var textNode = new NodeBuilder(); " +
      "textNode.addText(" + JSON.stringify(result)+ "); textNode = textNode.toNode(); " +
      "xdmp.documentInsert('/graphql/implicitSchema.sdl',textNode);";

  xdmp.eval(javascriptString,  null,
    {
      "database": schemaDatabaseId
    });

}

function checkConfigFile () {
  const configURI = "/graphql/config.json";

  const config = admin.getConfiguration();
  const schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());
  const javascriptString = `
  declareUpdate()
  const documentExists = fn.exists(fn.doc('${configURI}'))
  const defaultProps = { "schemaUri": "${schemaUri}", "queryDepthLimit": ${queryDepthLimit} };
  if(!documentExists) {
    let textNode = new NodeBuilder();
    textNode.addText(JSON.stringify(defaultProps)); 
    textNode = textNode.toNode();
    xdmp.documentInsert('${configURI}', textNode)
  }`;
  xdmp.eval(javascriptString,  null, {"database": schemaDatabaseId});
}

exports.transformGraphqlIntoOpticPlan = transformGraphqlIntoOpticPlan;
exports.transformGraphqlIntoASTPlan = transformGraphqlIntoASTPlan;
exports.executeOpticPlan = executeOpticPlan;
exports.createImplicitSchema = createImplicitSchema;
exports.storeImplicitSchema = storeImplicitSchema;
exports.createMapDataTypes = createMapDataTypes;
exports.checkConfigFile = checkConfigFile;
