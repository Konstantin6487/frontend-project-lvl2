import fs from 'fs';
import path from 'path';
import {
  has,
  identity,
  isPlainObject,
  union,
  isEmpty,
} from 'lodash';
import parseData from './parsers';

const getFormat = path.extname;
const getData = (pathToFile) => fs.readFileSync(pathToFile, 'utf8');

const makeLeafNode = (key, value, changeFlag = ' ') => ({
  key,
  value,
  changeFlag,
  type: 'leaf',
});

const makeInnerNode = (key, children, changeFlag = ' ') => ({
  key,
  children,
  changeFlag,
  type: 'inner',
});

const makeNode = (key, value, changeFlag, fn) => (isPlainObject(value)
  ? makeInnerNode(key, fn(value), changeFlag)
  : makeLeafNode(key, value, changeFlag));

const typeChangesActions = [
  {
    type: 'added',
    cond: (before, after, key) => !has(before, key) && has(after, key),
    action: (before, after, key, fn) => makeNode(key, after[key], isEmpty(before) ? ' ' : '+', fn),
  },
  {
    type: 'removed',
    cond: (before, after, key) => has(before, key) && !has(after, key),
    action: (before, after, key, fn) => makeNode(key, before[key], isEmpty(after) ? ' ' : '-', fn),
  },
  {
    type: 'not changed',
    cond: (before, after, key) => before[key] === after[key],
    action: (_, after, key) => makeLeafNode(key, after[key]),
  },
  {
    type: 'same key',
    cond: (before, after, key) => [
      has(before, key),
      has(after, key),
      isPlainObject(before[key]),
      isPlainObject(after[key]),
    ].every(Boolean),
    action: (before, after, key, fn) => makeInnerNode(key, fn(before[key], after[key])),
  },
  {
    type: 'changed',
    cond: () => identity,
    action: (before, after, key, fn) => [
      makeNode(key, after[key], '+', fn),
      makeNode(key, before[key], '-', fn),
    ],
  },
];

const makeAstDiff = (before = {}, after = {}) => {
  const beforeObjKeys = Object.keys(before);
  const afterObjKeys = Object.keys(after);
  const unionObjKeys = union(beforeObjKeys, afterObjKeys);
  return unionObjKeys.map((key) => {
    const currentTypeChangeData = typeChangesActions.find(({ cond }) => cond(before, after, key));
    const { action } = currentTypeChangeData;
    return action(before, after, key, makeAstDiff);
  });
};

const render = (ast, deepsLevel = 1) => {
  const renderIndent = (level, backIndentSize = 0) => `\n${' '.repeat(2 * level + backIndentSize)}`;
  const stringifyNodeValue = (node, fn) => (node.type === 'leaf'
    ? node.value
    : fn(node.children, deepsLevel + 2));

  const mappedCurrentTree = ast
    .flat()
    .map((node) => {
      const { changeFlag, key } = node;
      return `${renderIndent(deepsLevel)}${changeFlag} ${key}: ${stringifyNodeValue(node, render)}`;
    });
  return `{${mappedCurrentTree.join('')}${renderIndent(deepsLevel, -2)}}`;
};

export default (pathBeforeData, pathAfterData) => {
  const formatBeforeData = getFormat(pathBeforeData);
  const beforeData = getData(pathBeforeData);
  const parsedBeforeData = parseData(formatBeforeData, beforeData);

  const formatAfterData = getFormat(pathAfterData);
  const afterData = getData(pathAfterData);
  const parsedAfterData = parseData(formatAfterData, afterData);

  const astDiff = makeAstDiff(parsedBeforeData, parsedAfterData);
  const renderedDiff = render(astDiff);
  return renderedDiff;
};
