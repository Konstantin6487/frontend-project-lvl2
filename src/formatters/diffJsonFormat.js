import { isPlainObject } from 'lodash';

const defaultIndentSize = 4;

const stringifyNodeIndent = (indentSize) => ' '.repeat(indentSize);

const stringifyNodeValue = (nodeValue, prevIndentSize) => {
  if (isPlainObject(nodeValue)) {
    const startBracket = '{\n';
    const stringifiedIndent = stringifyNodeIndent(prevIndentSize);
    const endBracket = `${stringifiedIndent}}`;

    const stringifiedValue = Object
      .keys(nodeValue)
      .map((key) => {
        const innerIndentSize = prevIndentSize + defaultIndentSize;
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

const typesRenders = {
  added: ({ key, value }, depth) => {
    const prevIndentSize = depth * defaultIndentSize;
    return `${stringifyNodeIndent(prevIndentSize - 2)}+ ${key}: ${stringifyNodeValue(value, prevIndentSize)}`;
  },
  removed: ({ key, value }, depth) => {
    const prevIndentSize = depth * defaultIndentSize;
    return `${stringifyNodeIndent(prevIndentSize - 2)}- ${key}: ${stringifyNodeValue(value, prevIndentSize)}`;
  },
  nested: ({ key, children }, depth, fn) => {
    const prevIndentSize = depth * defaultIndentSize;
    return `${stringifyNodeIndent(prevIndentSize)}${key}: ${fn(children, depth + 1)}`;
  },
  unchanged: ({ key, value }, depth) => {
    const prevIndentSize = depth * defaultIndentSize;
    return `${stringifyNodeIndent(prevIndentSize)}${key}: ${stringifyNodeValue(value, prevIndentSize)}`;
  },
  changed: ({ key, newValue, originalValue }, depth) => (
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
  const startBracket = '{\n';
  const innerIndentSize = depth === 1 ? 0 : (depth - 1) * defaultIndentSize;
  const endBracket = `${stringifyNodeIndent(innerIndentSize)}}`;

  return `${startBracket}${renderedTypes}${endBracket}`;
};

export default format;
