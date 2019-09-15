import { isPlainObject } from 'lodash';

const baseIndentSize = 4;

const stringifyNodeIndent = (indentSize) => ' '.repeat(indentSize);

const stringifyNodeValue = (nodeValue, prevIndentSize) => {
  if (isPlainObject(nodeValue)) {
    const startBracket = '{\n';
    const stringifiedIndent = stringifyNodeIndent(prevIndentSize);
    const endBracket = `${stringifiedIndent}}`;

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

    return `${startBracket}${stringifiedValue}${endBracket}`;
  }
  return nodeValue;
};

const stringifyNode = (nodeKey, nodeValue, depth, delimeter = ' ') => {
  const prevIndentSize = depth * baseIndentSize;
  const indent = stringifyNodeIndent(prevIndentSize - 2);
  const value = stringifyNodeValue(nodeValue, prevIndentSize);
  return `${indent}${delimeter} ${nodeKey}: ${value}`;
};

const typesRenders = {
  added: ({ key, value }, depth) => stringifyNode(key, value, depth, '+'),
  removed: ({ key, value }, depth) => stringifyNode(key, value, depth, '-'),
  nested: ({ key, children }, depth, fn) => stringifyNode(key, fn(children, depth + 1), depth),
  unchanged: ({ key, value }, depth) => stringifyNode(key, value, depth),
  changed: ({ key, newValue, originalValue }, depth) => (
    `${stringifyNode(key, newValue, depth, '+')}\n${stringifyNode(key, originalValue, depth, '-')}`
  ),
};

const format = (ast, depth = 1) => {
  const renderedTypes = ast
    .map((node) => {
      const renderType = typesRenders[node.type];
      return `${renderType(node, depth, format)}\n`;
    })
    .join('');
  const startBracket = '{\n';
  const innerIndentSize = depth === 1 ? 0 : (depth - 1) * baseIndentSize;
  const endBracket = `${stringifyNodeIndent(innerIndentSize)}}`;

  return `${startBracket}${renderedTypes}${endBracket}`;
};

export default format;
