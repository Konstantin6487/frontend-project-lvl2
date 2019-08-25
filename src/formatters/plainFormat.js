import { get } from 'lodash';

const isChanged = Array.isArray;
const isRemoved = ({ changeFlag }) => changeFlag === '-';
const isAdded = ({ changeFlag }) => changeFlag === '+';
const isUnchanged = ({ changeFlag }) => changeFlag === ' ';

const formatNodeValue = (n) => (n.type === 'inner' ? '[complex value]' : n.value);
const formatNodePath = (keys) => keys.join('.');

const typeChangesMessages = [
  {
    type: 'changed',
    cond: isChanged,
    getMessage: ([prevValue, nextValue], keys) => `Property '${formatNodePath(keys)}' was updated. From ${formatNodeValue(nextValue)} to ${formatNodeValue(prevValue)}`,
  },
  {
    type: 'removed',
    cond: isRemoved,
    getMessage: (_, keys) => `Property '${formatNodePath(keys)}' was removed`,
  },
  {
    type: 'added',
    cond: isAdded,
    getMessage: (n, keys) => `Property '${formatNodePath(keys)}' was added with value: ${formatNodeValue(n)}`,
  },
  {
    type: 'unchanged',
    cond: isUnchanged,
    getMessage: () => '',
  },
];

const format = (ast, path = []) => {
  const getNodeKey = (n) => (isChanged(n) ? get(n, '0.key') : get(n, 'key'));

  const stringifyNodeValue = (node, fn, pathKeys) => {
    const currentNodeMessage = typeChangesMessages.find(({ cond }) => cond(node));
    return node.type === 'inner' && isUnchanged(node)
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
