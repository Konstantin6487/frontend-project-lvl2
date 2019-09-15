import { isPlainObject } from 'lodash';

const baseIndentSize = 4;

const stringifyNodeIndent = (indentSize) => ' '.repeat(indentSize);

const stringifyNodeValue = (nodeValue, prevIndentSize) => {
  if (isPlainObject(nodeValue)) {
    const start = '{\n';
    const stringifiedIndent = stringifyNodeIndent(prevIndentSize);
    const end = `${stringifiedIndent}}`;

    const stringifiedValue = Object
      .keys(nodeValue)
      .map((key) => {
        const innerIndentSize = prevIndentSize + baseIndentSize;
        const stringifiedInnerIndent = stringifyNodeIndent(innerIndentSize);
        const value = nodeValue[key];
        const stringified = stringifyNodeValue(value, innerIndentSize);
        return `${stringifiedInnerIndent}${key}: ${stringified}\n`;
      })
      .join('');

    return `${start}${stringifiedValue}${end}`;
  }
  return nodeValue;
};

const stringifyNode = (nodeKey, nodeValue, depth, mark = ' ') => {
  const prevIndentSize = depth * baseIndentSize;
  const indent = stringifyNodeIndent(prevIndentSize - 2);
  const value = stringifyNodeValue(nodeValue, prevIndentSize);
  return `${indent}${mark} ${nodeKey}: ${value}`;
};

const typesRenders = {
  added: ({ key, value }, depth) => stringifyNode(key, value, depth, '+'),
  removed: ({ key, value }, depth) => stringifyNode(key, value, depth, '-'),
  nested: ({ key, children }, depth, fn) => stringifyNode(key, fn(children, depth + 1), depth),
  unchanged: ({ key, value }, depth) => stringifyNode(key, value, depth),
  changed: ({ key, originalValue, newValue }, depth) => (
    `${typesRenders.added({ key, value: newValue }, depth)}\n${typesRenders.removed({ key, value: originalValue }, depth)}`
  ),
};

const format = (ast, depth = 1) => {
  const renderedTypes = ast
    .map((node) => {
      const renderType = typesRenders[node.type];
      return `${renderType(node, depth, format)}\n`;
    })
    .join('');
  const start = '{\n';
  const innerIndentSize = depth === 1 ? 0 : (depth - 1) * baseIndentSize;
  const end = `${stringifyNodeIndent(innerIndentSize)}}`;

  return `${start}${renderedTypes}${end}`;
};

export default format;
