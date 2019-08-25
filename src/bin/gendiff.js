#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';
import { toDiffJson, toPlain, toJson } from '../formatters';

const DEFAULT_FORMAT = 'diffjson';

const formatters = {
  diffjson: toDiffJson,
  plain: toPlain,
  json: toJson,
};

const getFormat = (format) => {
  const formatFn = formatters[format];
  if (!formatFn) {
    throw new Error(`unkown format: ${format}`);
  }
  return formatFn;
};

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [diffjson | plain | json]', 'output diffjson, plain or json diff')
  .arguments('<firstConfig> <secondConfig>')
  .action((arg1, arg2) => {
    const formatFn = program.format ? getFormat(program.format) : getFormat(DEFAULT_FORMAT);
    console.log(genDiff(arg1, arg2, formatFn));
  })
  .parse(process.argv);
