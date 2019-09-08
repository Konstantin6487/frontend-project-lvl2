import {
  has,
  identity,
  isPlainObject,
  union,
} from 'lodash';
import { getFormat, getData } from './helpers';
import parseData from './parsers';
import getRenderFormat from './formatters';

const makeDiffNode = (type) => (originalData, newData, key, fn) => {
  const newValue = newData[key];
  const originalValue = originalData[key];

  const typesActions = {
    added: () => ({ type, value: newValue, key }),
    removed: () => ({ type, value: originalValue, key }),
    nested: () => ({ type, children: fn(originalValue, newValue), key }),
    changed: () => ({
      type,
      newValue,
      originalValue,
      key,
    }),
    unchanged: () => ({ type, value: originalValue, key }),
  };
  const makeTypedNode = typesActions[type];
  return makeTypedNode();
};

const nodeTypesActions = [
  {
    check: (originalData, newData, key) => [
      !has(originalData, key),
      has(newData, key),
    ].every(Boolean),
    action: makeDiffNode('added'),
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      !has(newData, key),
    ].every(Boolean),
    action: makeDiffNode('removed'),
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      has(newData, key),
      [newData[key], originalData[key]].every(isPlainObject),
    ].every(Boolean),
    action: makeDiffNode('nested'),
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      has(newData, key),
      originalData[key] !== newData[key],
    ].every(Boolean),
    action: makeDiffNode('changed'),
  },
  {
    check: identity,
    action: makeDiffNode('unchanged'),
  },
];

const makeAstDiff = (originalData = {}, newData = {}) => {
  const originalDataKeys = Object.keys(originalData);
  const newDataKeys = Object.keys(newData);
  const unionDataKeys = union(originalDataKeys, newDataKeys);
  return unionDataKeys.map((key) => {
    const checkedCurrentNodeType = nodeTypesActions
      .find(({ check }) => check(originalData, newData, key));
    const { action } = checkedCurrentNodeType;
    return action(originalData, newData, key, makeAstDiff);
  });
};

export default (originalFilePath, newFilePath, formatType = 'json') => {
  const originalFileFormat = getFormat(originalFilePath);
  const originalFileData = getData(originalFilePath);
  const parsedOriginalFile = parseData(originalFileFormat, originalFileData);

  const newFileFormat = getFormat(newFilePath);
  const newFileData = getData(newFilePath);
  const parsedNewFile = parseData(newFileFormat, newFileData);

  const astDiff = makeAstDiff(parsedOriginalFile, parsedNewFile);
  console.log(JSON.stringify(astDiff));
  console.log(astDiff);
  const format = getRenderFormat(formatType);
  const renderedDiff = format(astDiff);
  return renderedDiff;
};
