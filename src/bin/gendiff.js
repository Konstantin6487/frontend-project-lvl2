#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';
import getFormat from '../formatters';

const DEFAULT_FORMAT = 'json';

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'json | plain')
  .arguments('<firstConfig> <secondConfig>')
  .action((arg1, arg2) => {
    const formatFn = program.format ? getFormat(program.format) : getFormat(DEFAULT_FORMAT);
    console.log(genDiff(arg1, arg2, formatFn));
  })
  .parse(process.argv);
