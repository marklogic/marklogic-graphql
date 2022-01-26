'use strict';

const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

const simpleGraphQlQueryString = `query someQuery {human { name height } }`;
const expectedOpticQueryString = "op.fromView(null, human)";
const actualOpticQueryString = callGraphQlParse(simpleGraphQlQueryString);
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString)
)

assertions