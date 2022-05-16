const test = require("/test/test-helper.xqy");
const {checkConfigFile} = require("/mlGraphqlLibOpticApi");
const admin = require("/MarkLogic/admin.xqy");
const assertions = [];
const configURI = "/graphql/config.json";
const config = admin.getConfiguration();
const schemaDatabaseId = admin.databaseGetSchemaDatabase(config, xdmp.database());
const {deleteDocumentInOtherDatabaseFunction} = require("/testHelpers");

const checkConfigExistence = () => {
  const javascriptString = `fn.exists(fn.doc('${configURI}'))`;
  return xdmp.eval(javascriptString,  null, {"database": schemaDatabaseId});
};

assertions.push(
  test.assertEqual(checkConfigExistence(), false, "The config file should not exists in the first phase.")
);

checkConfigFile();

assertions.push(
  test.assertTrue(checkConfigExistence(), "The config file should exists after calling the checker.")
);

const graphqlConfigFile = deleteDocumentInOtherDatabaseFunction(configURI);
xdmp.invokeFunction(
  graphqlConfigFile.delete,
  {database: xdmp.schemaDatabase()}
);

assertions;