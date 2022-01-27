'use strict';

const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

const simpleGraphQlQueryString = `query someQuery { Humans { name height } }`;
const expectedOpticQueryString = "op.fromView(null, Humans)";
const actualOpticQueryString = callGraphQlParse(simpleGraphQlQueryString);
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString)
)

const op = require('/MarkLogic/optic');
console.log("Expected Result=>\n"+op.fromView(null, "Humans").result());

const opResult = xdmp.eval(`const op = require('/MarkLogic/optic'); op.fromView('graphql', 'Humans').select(['id', 'name', 'height']).result()`);
console.log("Actual Result=>\n" + opResult);

assertions