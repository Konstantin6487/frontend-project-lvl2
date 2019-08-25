import { get } from 'lodash';

const formatNodeValue = (n) => (n.type === 'inner' ? '[complex value]' : n.value);
const formatNodePath = (keys) => keys.join('.');

const changesMessages = [
  {
    cond: Array.isArray,
    getMessage: ([prevValue, nextValue], keys) => `Property '${formatNodePath(keys)}' was updated. From ${formatNodeValue(nextValue)} to ${formatNodeValue(prevValue)}`,
  },
  {
    cond: (n) => n.changeFlag === '-',
    getMessage: (_, keys) => `Property '${formatNodePath(keys)}' was removed`,
  },
  {
    cond: (n) => n.changeFlag === '+',
    getMessage: (n, keys) => `Property '${formatNodePath(keys)}' was added with value: ${formatNodeValue(n)}`,
  },
  {
    cond: (n) => n.changeFlag === ' ',
    getMessage: () => '',
  },
];

const format = (ast, path = []) => {
  const getNodeKey = (n) => (Array.isArray(n) ? get(n, '0.key') : get(n, 'key'));

  const stringifyNodeValue = (node, fn, pathKeys) => {
    const currentNodeMessage = changesMessages.find(({ cond }) => cond(node));
    return node.type === 'inner' && node.changeFlag === ' '
      ? fn(node.children, pathKeys)
      : currentNodeMessage.getMessage(node, pathKeys);
  };

  return ast
    .map((node) => stringifyNodeValue(
      node,
      format,
      path.concat(getNodeKey(node)),
    ))
    .filter(Boolean)
    .join('\n');
};

export default format;
