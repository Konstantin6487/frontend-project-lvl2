import { isEmpty, isPlainObject } from 'lodash';

const baseIndentSize = 4;

const stringifyValue = (nodeValue, prevDepth) => {
  if (!isPlainObject(nodeValue)) {
    return nodeValue;
  }

  const endBracketIndent = ' '.repeat(prevDepth * baseIndentSize);
  const stringified = Object
    .keys(nodeValue)
    .map((key) => {
      const prefix = ' '.repeat((prevDepth * baseIndentSize) + baseIndentSize);
      const value = nodeValue[key];
      return isPlainObject(nodeValue[key])
        ? `${prefix}${key}: ${stringifyValue(value, prevDepth + 1)}`
        : `${prefix}${key}: ${value}`;
    })
    .join('\n');

  return `{\n${stringified}\n${endBracketIndent}}`;
};

const typesIndents = {
  added: '  + ',
  removed: '  - ',
  nested: ' '.repeat(baseIndentSize),
  unchanged: ' '.repeat(baseIndentSize),
};

const nodeTypesActions = [
  {
    check: (nodeType) => ['added', 'removed', 'unchanged'].some((type) => type === nodeType),
    action: ({ type, key, value }, depth) => `${typesIndents[type]}${key}: ${stringifyValue(value, depth + 1)}`,
  },
  {
    check: (nodeType) => nodeType === 'nested',
    action: ({ type, key, children }, depth, fn) => {
      const endBracketIndent = ' '.repeat(depth === 0
        ? baseIndentSize
        : (depth * baseIndentSize) + baseIndentSize);
      return (
        `${typesIndents[type]}${key}: {\n${fn(children, depth + 1)}\n${endBracketIndent}}`
      );
    },
  },
  {
    check: (nodeType) => nodeType === 'changed',
    action: ({ key, originalValue, newValue }, depth) => [
      `${typesIndents.added}${key}: ${stringifyValue(newValue, depth + 1)}`,
      `${typesIndents.removed}${key}: ${stringifyValue(originalValue, depth + 1)}`,
    ],
  },
];

export default (ast) => {
  if (isEmpty(ast)) {
    return '';
  }
  const inner = (tree, depth = 0) => tree
    .map((node) => {
      const checkedCurrentNodeType = nodeTypesActions.find(({ check }) => check(node.type));
      const { action } = checkedCurrentNodeType;
      return action(node, depth, inner);
    })
    .flat()
    .map((node) => {
      const indent = ' '.repeat(depth === 0 ? 0 : depth * baseIndentSize);
      return `${indent}${node}`;
    })
    .join('\n');
  const strinfified = inner(ast);
  return `{\n${strinfified}\n}`;
};
