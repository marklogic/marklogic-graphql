"use strict";
/* global NodeBuilder */ // For ESLint

const test = require("/test/test-helper.xqy");
const {deepEqual} = require("/testHelpers");

const assertions = [];

const arrayWithSingleObjectA = [{"A":"a"}];
const arrayWithSingleObjectB = [{"B":"b"}];
const arrayWithMultipleObjectsAB = [{"A":"a"}, {"B":"b"}];
const arrayWithMultipleObjectsBA = [{"B":"b"}, {"A":"a"}];
const arrayWithMultipleObjectsAAB = [{"A":"a"}, {"A":"a"}, {"B":"b"}];
const arrayWithMultipleObjectsABB = [{"A":"a"}, {"B":"b"}, {"B":"b"}];

const emptyArrayNode = (new NodeBuilder()).addNode([]).toNode();
const arrayNodeWithSingleObjectA = (new NodeBuilder()).addNode(arrayWithSingleObjectA).toNode();
const arrayNodeWithSingleObjectB = (new NodeBuilder()).addNode(arrayWithSingleObjectB).toNode();
const arrayNodeWithMultipleObjectAB = (new NodeBuilder()).addNode(arrayWithMultipleObjectsAB).toNode();
const arrayNodeWithMultipleObjectBA = (new NodeBuilder()).addNode(arrayWithMultipleObjectsBA).toNode();
const arrayNodeWithMultipleObjectAAB = (new NodeBuilder()).addNode(arrayWithMultipleObjectsAAB).toNode();
const arrayNodeWithMultipleObjectABB = (new NodeBuilder()).addNode(arrayWithMultipleObjectsABB).toNode();

const fromTest = {"data":{"Names":[{"height":"65"}, {"height":"65"}, {"height":"65"}, {"height":"70"}, {"height":"75"}, {"height":"80"}]}};
const fromTestNode = (new NodeBuilder()).addNode(fromTest).toNode();

assertions.push(
  test.assertTrue(deepEqual(emptyArrayNode, emptyArrayNode),
    "Two empty Array Nodes should be equal."),
  test.assertFalse(deepEqual(emptyArrayNode, arrayNodeWithSingleObjectA),
    "Array Nodes with a different number of objects should not be equal."),
  test.assertTrue(deepEqual(arrayNodeWithSingleObjectA, arrayNodeWithSingleObjectA),
    "A given array should be equal to itself."),
  test.assertFalse(deepEqual(arrayNodeWithSingleObjectA, arrayNodeWithSingleObjectB),
    "Two arrays containing a single (but different) objects, should not be equal."),
  test.assertFalse(deepEqual(arrayNodeWithSingleObjectA, arrayNodeWithMultipleObjectAB),
    "If one array is a superset of the other array (and contains more objects), they should not be equal."),
  test.assertTrue(deepEqual(arrayNodeWithMultipleObjectAB, arrayNodeWithMultipleObjectBA),
    "Two arrays with the same objects, but in a different order, should be equal."),
  test.assertFalse(deepEqual(arrayNodeWithMultipleObjectAAB, arrayNodeWithMultipleObjectABB),
    "The resulting data set does not match the expected results."),
  test.assertTrue(deepEqual(fromTestNode, fromTestNode),
    "Two arrays with the same objects, but in a different order, should be equal."),
);

assertions;