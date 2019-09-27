import { isEmpty, isPlainObject } from 'lodash';

const baseIndentSize = 4;
const fillIndent = (depth = 1) => ' '.repeat(depth * baseIndentSize);
const baseIndent = fillIndent();

const stringifyValue = (nodeValue, depth) => {
  if (!isPlainObject(nodeValue)) {
    return nodeValue;
  }

  const indent = fillIndent(depth);
  const stringified = Object
    .keys(nodeValue)
    .map((key) => {
      const value = nodeValue[key];
      return isPlainObject(value)
        ? `${indent}${baseIndent}${key}: ${stringifyValue(value, depth + 1)}`
        : `${indent}${baseIndent}${key}: ${value}`;
    })
    .join('\n');
  return `{\n${stringified}\n${indent}}`;
};

const nodeTypesActions = {
  added: ({ key, value }, depth) => `${fillIndent(depth)}${baseIndent.slice(0, -2)}+ ${key}: ${stringifyValue(value, depth + 1)}`,
  removed: ({ key, value }, depth) => `${fillIndent(depth)}${baseIndent.slice(0, -2)}- ${key}: ${stringifyValue(value, depth + 1)}`,
  unchanged: ({ key, value }, depth) => `${fillIndent(depth)}${baseIndent}${key}: ${stringifyValue(value, depth + 1)}`,
  nested: ({ key, children }, depth, fn) => (
    `${fillIndent(depth)}${baseIndent}${key}: {\n${fn(children, depth + 1)}\n${fillIndent(depth)}${baseIndent}}`
  ),
  changed: ({ key, originalValue, newValue }, depth) => [
    nodeTypesActions.added({ key, value: newValue }, depth),
    nodeTypesActions.removed({ key, value: originalValue }, depth),
  ],
};

export default (ast) => {
  if (isEmpty(ast)) {
    return '';
  }

  const inner = (tree, depth = 0) => tree
    .map((node) => {
      const action = nodeTypesActions[node.type];
      return action(node, depth, inner);
    })
    .flat()
    .join('\n');
  const strinfified = inner(ast);

  return `{\n${strinfified}\n}`;
};
