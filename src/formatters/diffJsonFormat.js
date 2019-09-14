import { isPlainObject } from 'lodash';

const indentSize = 4;

const stringifyNodeValue = (nodeValue, prevIndent) => {
  if (isPlainObject(nodeValue)) {
    const startBracket = '{\n';
    const endBracket = `${' '.repeat(prevIndent)}}`;

    const stringifiedValue = Object
      .keys(nodeValue)
      .map((key) => {
        const newIndent = ' '.repeat(prevIndent + indentSize);
        const value = nodeValue[key];
        const stringified = stringifyNodeValue(value, newIndent);
        return `${newIndent}${key}: ${stringified}\n`;
      })
      .join('');

    return `${startBracket}${stringifiedValue}${endBracket}`;
  }
  return nodeValue;
};

const typesRenders = {
  added: ({ key, value }, depth) => {
    const innerIndent = depth * indentSize;
    return `${' '.repeat(innerIndent - 2)}+ ${key}: ${stringifyNodeValue(value, innerIndent)}`;
  },
  removed: ({ key, value }, depth) => {
    const innerIndent = depth * indentSize;
    return `${' '.repeat(innerIndent - 2)}- ${key}: ${stringifyNodeValue(value, innerIndent)}`;
  },
  nested: ({ key, children }, depth, fn) => {
    const innerIndent = depth * indentSize;
    return `${' '.repeat(innerIndent)}${key}: ${fn(children, depth + 1)}`;
  },
  unchanged: ({ key, value }, depth) => {
    const innerIndent = depth * indentSize;
    return `${' '.repeat(innerIndent)}${key}: ${stringifyNodeValue(value, innerIndent)}`;
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
  const endBracket = `${' '.repeat(depth === 1 ? 0 : (depth - 1) * indentSize)}}`;

  return `${startBracket}${renderedTypes}${endBracket}`;
};

export default format;
