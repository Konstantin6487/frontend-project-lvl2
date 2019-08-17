import fs from 'fs';
import path from 'path';
import { union } from 'lodash';
import parseData from './parsers';

const getFormat = path.extname;
const getData = (pathToFile) => fs.readFileSync(pathToFile, 'utf8');
const makeNode = (key, value, flag = ' ') => ({ key, value, flag });

const makeAstDiff = (beforeData, afterData) => {
  const beforeDataKeys = Object.keys(beforeData);
  const afterDataKeys = Object.keys(afterData);
  const unionKeys = union(beforeDataKeys, afterDataKeys);

  const keysChangeStatusMap = [
    {
      statusName: 'add',
      cond: (before, after, key) => !before.includes(key) && after.includes(key),
    },
    {
      statusName: 'remove',
      cond: (before, after, key) => before.includes(key) && !after.includes(key),
    },
    {
      statusName: 'same',
      cond: (before, after, key) => before.includes(key) && after.includes(key),
    },
  ];

  return unionKeys.map((key) => {
    const beforeDataValue = beforeData[key];
    const afterDataValue = afterData[key];

    if (beforeDataValue === afterDataValue) {
      return makeNode(key, afterDataValue);
    }
    const currentKeyChangeStatus = keysChangeStatusMap
      .find(({ cond }) => cond(beforeDataKeys, afterDataKeys, key));
    const { statusName } = currentKeyChangeStatus;

    const makeNodeByStatusFunctions = {
      remove: (node) => makeNode(node.key, node.beforeDataValue, '-'),
      add: (node) => makeNode(node.key, node.afterDataValue, '+'),
      same: (node) => [
        makeNode(node.key, node.afterDataValue, '+'),
        makeNode(node.key, node.beforeDataValue, '-'),
      ],
    };
    const makeNodeFn = makeNodeByStatusFunctions[statusName];
    return makeNodeFn({ beforeDataValue, afterDataValue, key });
  });
};

const render = (ast, deeps = 1) => {
  const flattenAst = ast.flat(Infinity);
  const mappedAst = flattenAst.map((node) => {
    const currentDeepTab = ' '.repeat(2 * deeps);
    return `\n${currentDeepTab}${node.flag} ${node.key}: ${node.value}`;
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
