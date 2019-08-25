#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';
import { toJsonFormat, toPlainFormat } from '../formatters';

const formatters = {
  plain: toPlainFormat,
  json: toJsonFormat,
};

const getFormatFn = (format) => formatters[format];

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'json | plain')
  .arguments('<firstConfig> <secondConfig>')
  .action((arg1, arg2) => {
    console.log(genDiff(arg1, arg2, getFormatFn(program.format)));
  })
  .parse(process.argv);
