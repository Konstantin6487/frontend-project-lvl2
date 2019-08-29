#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [diffjson | plain | json]', 'output diffjson, plain or json diff')
  .arguments('<firstConfig> <secondConfig>')
  .action((arg1, arg2) => {
    console.log(genDiff(arg1, arg2, program.format));
  })
  .parse(process.argv);
