import fs from 'fs';
import path from 'path';
import { identity, isPlainObject, union } from 'lodash';
import parseData from './parsers';

const getFormat = path.extname;
const getData = (pathToFile) => fs.readFileSync(pathToFile, 'utf8');

const makeLeafNode = (key, value, flag = ' ') => ({
  key,
  value,
  flag,
  type: 'leaf',
  getType() { return this.type; },
});

const makeInnerNode = (key, children, flag = ' ') => ({
  key,
  children,
  flag,
  type: 'inner',
  getType() { return this.type; },
});

const makeChildren = (data) => Object
  .keys(data)
  .map((key) => (isPlainObject(data[key])
    ? makeInnerNode(key, makeChildren(data[key]))
    : makeLeafNode(key, data[key])));

const propChangeStatuses = [
  {
    changeStatusName: 'addProp',
    cond: (before, after, key) => !before.includes(key) && after.includes(key),
  },
  {
    changeStatusName: 'removeProp',
    cond: (before, after, key) => before.includes(key) && !after.includes(key),
  },
  {
    changeStatusName: 'sameProp',
    cond: (before, after, key) => before.includes(key) && after.includes(key),
  },
];

const typesActions = [
  {
    cond: (value, value2) => [value, value2].some(isPlainObject),
    action: (value, value2, key) => [value, value2].map((v) => {
      const flag = v === value2 ? '+' : '-';
      return isPlainObject(v)
        ? makeInnerNode(key, makeChildren(v), flag)
        : makeLeafNode(key, v, flag);
    }),
  },
  {
    cond: identity,
    action: (value, value2, key) => [
      makeLeafNode(key, value2, '+'),
      makeLeafNode(key, value, '-'),
    ],
  },
];

const makeAstDiff = (before, after = {}) => {
  const beforeObjKeys = Object.keys(before);
  const afterObjKeys = Object.keys(after);
  const unionObjKeys = union(beforeObjKeys, afterObjKeys);

  return unionObjKeys.map((key) => {
    const valueBefore = before[key];
    const valueAfter = after[key];
    if (valueBefore === valueAfter) {
      return makeLeafNode(key, valueAfter);
    }

    const changeStatusActions = {
      addProp: (_, newPropValue, newPropKey) => (isPlainObject(newPropValue)
        ? makeInnerNode(newPropKey, makeChildren(newPropValue), '+')
        : makeLeafNode(newPropKey, newPropValue, '+')),
      removeProp: (removedPropValue, _, propKey) => (isPlainObject(removedPropValue)
        ? makeInnerNode(propKey, makeChildren(removedPropValue), '-')
        : makeLeafNode(propKey, removedPropValue, '-')),
      sameProp: (removedPropValue, newPropValue, propKey) => {
        if ([removedPropValue, newPropValue].every(isPlainObject)) {
          return makeInnerNode(key, makeAstDiff(removedPropValue, newPropValue));
        }

        const strategy = typesActions.find(({ cond }) => cond(
          removedPropValue,
          newPropValue,
          propKey,
        ));
        const { action } = strategy;
        return action(removedPropValue, newPropValue, propKey);
      },
    };

    const getChangeStatus = propChangeStatuses.find(({ cond }) => cond(
      beforeObjKeys,
      afterObjKeys,
      key,
    ));

    const { changeStatusName } = getChangeStatus;
    const makeDiffNode = changeStatusActions[changeStatusName];
    return makeDiffNode(valueBefore, valueAfter, key);
  });
};

const render = (ast, deeps = 1) => {
  const mappedAst = ast
    .flat(Infinity)
    .map((node) => {
      const currentDeepTab = ' '.repeat(2 * deeps);
      if (node.getType() === 'leaf') {
        return `\n${currentDeepTab}${node.flag} ${node.key}: ${node.value}`;
      }
      return `\n${currentDeepTab}${node.flag} ${node.key}: ${render(node.children, deeps + 2)}`;
    });
  return `{${mappedAst.join('')}\n${' '.repeat(2 * deeps - 2)}}`;
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
