import ini from 'ini';
import yaml from 'js-yaml';

const parsers = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  yaml: yaml.safeLoad,
  ini: ini.parse,
};

const getParser = (fileExt) => {
  const parse = parsers[fileExt];
  if (!parse) {
    throw new Error(`unknown file extension: ${fileExt}`);
  }
  return parse;
};

export default (fileExt, data) => {
  const parse = getParser(fileExt);
  const parsed = parse(data);
  return parsed;
};
