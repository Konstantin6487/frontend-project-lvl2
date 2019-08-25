import toJson from './jsonFormat';
import toPlain from './plainFormat';

const formatters = {
  plain: toPlain,
  json: toJson,
};

export default (format) => {
  const formatFn = formatters[format];
  if (!formatFn) {
    throw new Error(`unkown format: ${format}`);
  }
  return formatFn;
};
