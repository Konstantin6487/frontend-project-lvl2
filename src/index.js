import {
  has,
  identity,
  isEmpty,
  isPlainObject,
  union,
} from 'lodash';
import { getExtName, getData } from './helpers';
import parseData from './parsers';
import getRenderFormat from './formatters';

const nodeTypesContent = [
  {
    check: (originalData, newData, key) => [
      !has(originalData, key),
      has(newData, key),
    ].every(Boolean),
    getContent: ({ newValue }) => ({ value: newValue }),
    type: 'added',
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      !has(newData, key),
    ].every(Boolean),
    getContent: ({ originalValue }) => ({ value: originalValue }),
    type: 'removed',
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      has(newData, key),
      [newData[key], originalData[key]].every(isPlainObject),
    ].every(Boolean),
    getContent: ({ newValue, originalValue }, fn) => ({ children: fn(originalValue, newValue) }),
    type: 'nested',
  },
  {
    check: (originalData, newData, key) => [
      has(originalData, key),
      has(newData, key),
      originalData[key] !== newData[key],
    ].every(Boolean),
    getContent: identity,
    type: 'changed',
  },
  {
    check: identity,
    getContent: ({ originalValue }) => ({ value: originalValue }),
    type: 'unchanged',
  },
];

const makeAstDiff = (originalData = {}, newData = {}) => {
  if ([originalData, newData].every(isEmpty)) {
    return [];
  }

  const originalDataKeys = Object.keys(originalData);
  const newDataKeys = Object.keys(newData);
  const unionDataKeys = union(originalDataKeys, newDataKeys);

  return unionDataKeys.map((key) => {
    const checkedCurrentNodeType = nodeTypesContent
      .find(({ check }) => check(originalData, newData, key));
    const { getContent, type } = checkedCurrentNodeType;
    const newValue = newData[key];
    const originalValue = originalData[key];
    const nodeContent = getContent({ newValue, originalValue }, makeAstDiff);
    const node = ({ type, ...nodeContent, key });

    return node;
  });
};

export default (originalFilePath, newFilePath, formatType) => {
  const originalFileExt = getExtName(originalFilePath);
  const originalFileData = getData(originalFilePath);
  const parsedOriginalFile = parseData(originalFileExt, originalFileData);

  const newFileExt = getExtName(newFilePath);
  const newFileData = getData(newFilePath);
  const parsedNewFile = parseData(newFileExt, newFileData);

  const astDiff = makeAstDiff(parsedOriginalFile, parsedNewFile);
  const format = getRenderFormat(formatType);
  const renderedDiff = format(astDiff);

  return renderedDiff;
};
