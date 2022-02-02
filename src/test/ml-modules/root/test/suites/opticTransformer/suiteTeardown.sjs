// This file would be ran once, after all tests in the suite have ran
declareUpdate();

xdmp.documentDelete("/humans.xml");

function test29197(uri) {
    return {
        setUri: function setUri(_uri) { uri = _uri; },
        delete: function docDelete() { declareUpdate(); xdmp.documentDelete(uri); }
    };
};
const testInvoke = test29197('/templates/humans-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);