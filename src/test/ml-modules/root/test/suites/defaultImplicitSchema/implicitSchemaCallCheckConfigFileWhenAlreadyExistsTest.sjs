const test = require("/test/test-helper.xqy");
const {checkConfigFile} = require("/mlGraphqlLibOpticApi");
const admin = require("/MarkLogic/admin.xqy");
const assertions = [];
const configURI = "/graphql/config.json";
const {deleteDocumentInOtherDatabaseFunction} = require("/testHelpers");

const config = admin.getConfiguration();
const schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());

const checkExistence = () => {
  const javascriptString = `fn.exists(fn.doc('${configURI}'))`;
  return xdmp.eval(javascriptString,  null, {"database": schemaDatabaseId});
};

const createConfigFileWithOtherProperties = () => {
  const javascriptString = `
    declareUpdate()
    const documentExists = fn.exists(fn.doc('${configURI}'))
    if(!documentExists) {
        let textNode = new NodeBuilder();
        textNode.addText(JSON.stringify({ "schemaUri": "test", "queryDepthLimit": 2 })); 
        textNode = textNode.toNode();
        xdmp.documentInsert('${configURI}', textNode)
  }`;
  xdmp.eval(javascriptString,  null, {"database": schemaDatabaseId});
};

const getConfigFileAsJSON = () => {
  const javascriptString = `JSON.parse(fn.document('${configURI}'))`;
  return xdmp.eval(javascriptString,  null, {"database": schemaDatabaseId});
};

assertions.push(
  test.assertEqual(checkExistence(), false, "The config file should not exists in the first phase.")
);

createConfigFileWithOtherProperties();

const initialConfigFile = getConfigFileAsJSON();

assertions.push(
  test.assertTrue(checkExistence(), "The config file should be there after creating one.")
);

checkConfigFile();

assertions.push(
  test.assertTrue(checkExistence(), "The config file should be there after calling the checker.")
);

const configFileAfterChecker = getConfigFileAsJSON();

Object.keys(initialConfigFile).map(key => {
  assertions.push(
    test.assertEqual(initialConfigFile[key], configFileAfterChecker[key], `The config file should be the same key = ${key}`)
  );
});

const graphqlConfigFile = deleteDocumentInOtherDatabaseFunction(configURI);
xdmp.invokeFunction(
  graphqlConfigFile.delete,
  {database: xdmp.schemaDatabase()}
);

assertions;
