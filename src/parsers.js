import ini from 'ini';
import yaml from 'js-yaml';

const parsers = {
  '.json': JSON.parse,
  '.yml': yaml.safeLoad,
  '.yaml': yaml.safeLoad,
  '.ini': ini.parse,
};

const getParser = (formatType) => {
  const parse = parsers[formatType];
  if (!parse) {
    throw new Error(`unkown format: ${formatType}`);
  }
  return parse;
};

export default (formatType, data) => {
  const parse = getParser(formatType);
  const parsed = parse(data);
  return parsed;
};
