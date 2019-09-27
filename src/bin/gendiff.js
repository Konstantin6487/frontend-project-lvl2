#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [pretty | plain | json]', 'output pretty, plain or json diff', 'pretty')
  .arguments('<originalConfig> <newConfig>')
  .action((originalConfigPath, newConfigPath) => {
    console.log(genDiff(originalConfigPath, newConfigPath, program.format));
  })
  .parse(process.argv);
