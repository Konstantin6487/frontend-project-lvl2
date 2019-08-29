import toDiffJson from './diffJsonFormat';
import toPlain from './plainFormat';
import toJson from './jsonFormat';

const formatters = {
  diffjson: toDiffJson,
  plain: toPlain,
  json: toJson,
};

export default (formatType) => {
  const formatFn = formatters[formatType];
  if (!formatFn) {
    throw new Error(`unkown format: ${formatType}`);
  }
  return formatFn;
};
