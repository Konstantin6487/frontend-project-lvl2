import {
  has,
  identity,
  isPlainObject,
  union,
} from 'lodash';
import { getExtName, getData } from './helpers';
import parseData from './parsers';
import getRenderFormat from './formatters';

const makeDiffNode = (type) => (originalData, newData, key, fn) => {
  const newValue = newData[key];
  const originalValue = originalData[key];

  const typesActions = {
    added: () => ({ value: newValue }),
    removed: () => ({ value: originalValue }),
    nested: () => ({ children: fn(originalValue, newValue) }),
    changed: () => ({ newValue, originalValue }),
    unchanged: () => ({ value: originalValue }),
  };
  const makeNodeContent = typesActions[type];
  const content = makeNodeContent();
  return ({ type, ...content, key });
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

export default (originalFilePath, newFilePath, formatType = 'diffjson') => {
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
