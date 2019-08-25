const format = (ast, deepsLevel = 1) => {
  const renderIndent = (level, backIndentSize = 0) => `\n${' '.repeat(2 * level + backIndentSize)}`;
  const stringifyNodeValue = (node, fn) => (node.type === 'leaf'
    ? node.value
    : fn(node.children, deepsLevel + 2));

  const mappedCurrentTree = ast
    .flat()
    .map((node) => {
      const { changeFlag, key } = node;
      return `${renderIndent(deepsLevel)}${changeFlag} ${key}: ${stringifyNodeValue(node, format)}`;
    });
  return `{${mappedCurrentTree.join('')}${renderIndent(deepsLevel, -2)}}`;
};

export default format;
