// This file would be ran once, after all tests in the suite have ran
declareUpdate();

xdmp.documentDelete("/humans.xml");

function test29197(uri) {
    return {
        setUri: function setUri(_uri) { uri = _uri; },
        delete: function docDelete() { declareUpdate(); xdmp.documentDelete(uri); }
    };
};
let testInvoke = test29197('/templates/humans-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);
testInvoke = test29197('/templates/cars-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);
testInvoke = test29197('/templates/laptops-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);
testInvoke = test29197('/templates/houses-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);
testInvoke = test29197('/templates/rooms-TDE.tdej');
xdmp.invokeFunction(
    testInvoke.delete,
    {database:xdmp.schemaDatabase()}
);