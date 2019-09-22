import { isPlainObject } from 'lodash';

const baseIndentSize = 4;

const stringifyValue = (nodeValue, prevDepth) => {
  if (!isPlainObject(nodeValue)) {
    return nodeValue;
  }

  const currDepth = prevDepth + 1;
  const endBracket = ' '.repeat(currDepth * baseIndentSize);

  const stringified = Object
    .keys(nodeValue)
    .map((key) => {
      const prefix = ' '.repeat((currDepth * baseIndentSize) + baseIndentSize);
      const value = nodeValue[key];
      return isPlainObject(nodeValue[key])
        ? `${prefix}${key}: ${stringifyValue(value, currDepth + 1)}`
        : `${prefix}${key}: ${value}`;
    })
    .join('\n');

  return `{\n${stringified}\n${endBracket}}`;
};

const prefixTypes = {
  added: '  + ',
  removed: '  - ',
  nested: ' '.repeat(baseIndentSize),
  unchanged: ' '.repeat(baseIndentSize),
};

const nodeTypesActions = [
  {
    check: (nodeType) => ['added', 'removed', 'unchanged'].some((type) => type === nodeType),
    action: ({ type, key, value }, depth) => `${prefixTypes[type]}${key}: ${stringifyValue(value, depth)}`,
  },
  {
    check: (nodeType) => nodeType === 'nested',
    action: ({ type, key, children }, depth, fn) => {
      const endBracket = ' '.repeat(depth === 0 ? baseIndentSize : (depth * baseIndentSize) + baseIndentSize);
      return (
        `${prefixTypes[type]}${key}: {\n${fn(children, depth + 1)}\n${endBracket}}`
      );
    },
  },
  {
    check: (nodeType) => nodeType === 'changed',
    action: ({ key, originalValue, newValue }, depth) => [
      `${prefixTypes.added}${key}: ${stringifyValue(newValue, depth)}`,
      `${prefixTypes.removed}${key}: ${stringifyValue(originalValue, depth)}`,
    ],
  },
];

export default (ast) => {
  const inner = (tree, depth = 0) => tree
    .map((node) => {
      const checkedCurrentNodeType = nodeTypesActions.find(({ check }) => check(node.type));
      const { action } = checkedCurrentNodeType;
      return action(node, depth, inner);
    })
    .flat(Infinity)
    .map((node) => `${' '.repeat(depth === 0 ? 0 : depth * baseIndentSize)}${node}`)
    .join('\n');
  const strinfified = inner(ast);
  return `{\n${strinfified}\n}`;
};
