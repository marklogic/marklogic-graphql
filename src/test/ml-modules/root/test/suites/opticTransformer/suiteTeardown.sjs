// This file would be ran once, after all tests in the suite have ran
"use strict";
/* global declareUpdate, xdmp */ // For ESLint

declareUpdate();

xdmp.documentDelete("/humans.xml");

function deleteDocumentInOtherDatabaseFunction(uri) {
    return {
        setUri: function setUri(_uri) { uri = _uri; },
        delete: function docDelete() { declareUpdate(); xdmp.documentDelete(uri); }
    };
}

const dataFiles = ["humans", "cars", "laptops", "houses", "rooms", "drinks"];
// Delete the TDE templates from the schemas database
dataFiles.forEach(function(template) {
    let testInvoke = deleteDocumentInOtherDatabaseFunction("/templates/" + template + "-TDE.tdej");
    xdmp.invokeFunction(
        testInvoke.delete,
        {database:xdmp.schemaDatabase()}
    );
});