import toPretty from './prettyFormat';
import toPlain from './plainFormat';
import toJson from './jsonFormat';

const formatters = {
  pretty: toPretty,
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
