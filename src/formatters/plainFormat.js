import { isPlainObject, identity } from 'lodash';

const stringifyNodePath = (path) => path.join('.');
const stringifyNodeValue = (nodeValue) => (isPlainObject(nodeValue) ? '[complex value]' : nodeValue);

const typesRenders = {
  added: ({ value }, path) => (
    `Property '${stringifyNodePath(path)}' was added with value: ${stringifyNodeValue(value)}`
  ),
  removed: (_, path) => `Property '${stringifyNodePath(path)}' was removed`,
  nested: ({ children }, path, fn) => fn(children, path),
  unchanged: () => null,
  changed: ({ newValue, originalValue }, path) => (
    `Property '${stringifyNodePath(path)}' was updated. From ${stringifyNodeValue(originalValue)} to ${stringifyNodeValue(newValue)}`
  ),
};

export default (ast) => {
  const getChangesList = (tree, path = []) => tree
    .map((node) => {
      const { key, type } = node;
      const renderType = typesRenders[type];
      return renderType(node, path.concat(key), getChangesList);
    })
    .filter(identity)
    .flat();
  return getChangesList(ast).join('\n');
};
