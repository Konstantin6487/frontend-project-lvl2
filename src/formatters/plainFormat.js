const format = (ast, path = []) => {
  const stringifyNodeValue = (node, fn, pathKeys) => {
    const formatNodeValue = (n) => (n.type === 'inner' ? '[complex value]' : n.value);
    const formatNodePath = (keys) => keys.join('.');
    const flagActions = [
      {
        flag: Array.isArray,
        action: (n) => `Property '${formatNodePath(pathKeys)}' was updated. From ${formatNodeValue(n[1])} to ${formatNodeValue(n[0])}`,
      },
      {
        flag: (n) => n.changeFlag === '-',
        action: () => `Property '${formatNodePath(pathKeys)}' was removed`,
      },
      {
        flag: (n) => n.changeFlag === '+',
        action: (n) => `Property '${formatNodePath(pathKeys)}' was added with value: ${formatNodeValue(n)}`,
      },
      {
        flag: (n) => n.changeFlag === ' ',
        action: () => '',
      },
    ];
    const currentAction = flagActions.find(({ flag }) => flag(node));
    return node.type === 'inner' && node.changeFlag === ' '
      ? fn(node.children, pathKeys)
      : currentAction.action(node);
  };

  const mappedCurrentTree = ast
    .map((node) => `${stringifyNodeValue(node, format, [
      ...path,
      Array.isArray(node) ? node[0].key : node.key,
    ])}`);
  return mappedCurrentTree.filter((n) => n).join('\n');
};

export default format;
