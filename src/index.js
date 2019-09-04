import {
  has,
  identity,
  isPlainObject,
  union,
  isEmpty,
} from 'lodash';
import { getFormat, getData } from './helpers';
import parseData from './parsers';
import getRenderFormat from './formatters';

const FLAG_ADDED_VALUE = '+';
const FLAG_REMOVED_VALUE = '-';
const FLAG_SAME_VALUE = ' ';

const makeLeafNode = (key, value, changeFlag = FLAG_SAME_VALUE) => ({
  key,
  value,
  changeFlag,
  type: 'leaf',
});

const makeInnerNode = (key, children, changeFlag = FLAG_SAME_VALUE) => ({
  key,
  children,
  changeFlag,
  type: 'inner',
});

const makeNode = (value, value2) => (key, changeFlag, fn) => {
  if (value && value2) {
    return makeInnerNode(key, fn(value, value2), changeFlag);
  }
  return isPlainObject(value)
    ? makeInnerNode(key, fn(value), changeFlag)
    : makeLeafNode(key, value, changeFlag);
};

const typeChangesActions = [
  {
    type: 'added',
    cond: (original, newest, key) => !has(original, key) && has(newest, key),
    action: (original, newest, key, fn) => makeNode(newest[key])(key, isEmpty(original)
      ? FLAG_SAME_VALUE
      : FLAG_ADDED_VALUE, fn),
  },
  {
    type: 'removed',
    cond: (original, newest, key) => has(original, key) && !has(newest, key),
    action: (original, newest, key, fn) => makeNode(original[key])(key, isEmpty(newest)
      ? FLAG_SAME_VALUE
      : FLAG_REMOVED_VALUE, fn),
  },
  {
    type: 'nested',
    cond: (original, newest, key) => has(original, key) && has(newest, key)
      && [original[key], newest[key]].every(isPlainObject),
    action: (original, newest, key, fn) => makeNode(original[key], newest[key])(key, FLAG_SAME_VALUE, fn),
  },
  {
    type: 'unchanged',
    cond: (original, newest, key) => original[key] === newest[key],
    action: (_, newest, key) => makeNode(newest[key])(key),
  },
  {
    type: 'changed',
    cond: () => identity,
    action: (original, newest, key, fn) => [
      makeNode(newest[key])(key, FLAG_ADDED_VALUE, fn),
      makeNode(original[key])(key, FLAG_REMOVED_VALUE, fn),
    ],
  },
];

const makeAstDiff = (originalData = {}, newData = {}) => {
  const originalDataKeys = Object.keys(originalData);
  const newDataKeys = Object.keys(newData);
  const unionDataKeys = union(originalDataKeys, newDataKeys);
  return unionDataKeys.map((key) => {
    const currentTypeChangeData = typeChangesActions
      .find(({ cond }) => cond(originalData, newData, key));
    const { action } = currentTypeChangeData;
    return action(originalData, newData, key, makeAstDiff);
  });
};

export default (originalFilePath, newFilePath, formatType = 'diffjson') => {
  const originalFileFormat = getFormat(originalFilePath);
  const originalFileData = getData(originalFilePath);
  const parsedOriginalFile = parseData(originalFileFormat, originalFileData);

  const newFileFormat = getFormat(newFilePath);
  const newFileData = getData(newFilePath);
  const parsedNewFile = parseData(newFileFormat, newFileData);

  const astDiff = makeAstDiff(parsedOriginalFile, parsedNewFile);
  const format = getRenderFormat(formatType);
  const renderedDiff = format(astDiff);
  return renderedDiff;
};
