import toDiffJson from './diffJsonFormat';
import toPlain from './plainFormat';
import toJson from './jsonFormat';

const formatters = {
  diffjson: toDiffJson,
  plain: toPlain,
  json: toJson,
};

export default (formatType) => {
  const format = formatters[formatType];
  if (!format) {
    throw new Error(`unknown format: ${formatType}`);
  }
  return format;
};
