import ini from 'ini';
import yaml from 'js-yaml';

const parsers = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  yaml: yaml.safeLoad,
  ini: ini.parse,
};

const getParser = (dataType) => {
  const parse = parsers[dataType];
  if (!parse) {
    throw new Error(`unknown data type: ${dataType}`);
  }
  return parse;
};

export default (dataType, data) => {
  const parse = getParser(dataType);
  const parsed = parse(data);
  return parsed;
};
