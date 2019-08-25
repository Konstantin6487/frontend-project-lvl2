#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';
import { toJson, toPlain } from '../formatters';

const DEFAULT_FORMAT = 'json';

const formatters = {
  json: toJson,
  plain: toPlain,
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
  .option('-f, --format [json | plain]', 'output json or plain diff')
  .arguments('<firstConfig> <secondConfig>')
  .action((arg1, arg2) => {
    const formatFn = program.format ? getFormat(program.format) : getFormat(DEFAULT_FORMAT);
    console.log(genDiff(arg1, arg2, formatFn));
  })
  .parse(process.argv);
