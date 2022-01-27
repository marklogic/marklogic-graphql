'use strict';

const test = require("/test/test-helper.xqy");
const {callGraphQlParse} = require('/mlGraphqlLib');
const assertions = [];

const simpleGraphQlWithArgumentQueryString = `query someQuery { Humans (id: "1000") { name height } }`;
const expectedOpticQueryString = "op.fromView(null, human).where(op.eq(op.col('id'), '1000'))";
const actualOpticQueryString = callGraphQlParse(simpleGraphQlWithArgumentQueryString);
assertions.push(
    test.assertEqual(expectedOpticQueryString, actualOpticQueryString)
)

const op = require('/MarkLogic/optic');
console.log(op.fromView(null, "Humans").result());

assertions