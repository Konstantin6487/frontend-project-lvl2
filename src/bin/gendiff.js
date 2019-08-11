#!/usr/bin/env node

import program from 'commander';
import genDiff from '..';

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f --format [type]', 'Output format')
  .arguments('<firstConfig>')
  .arguments('<secondConfig>')
  .action((firstConfig, secondConfig) => console.log(genDiff(firstConfig, secondConfig)));

program.parse(process.argv);
