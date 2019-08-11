#!/usr/bin/env node

const program = require('commander');

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f --format [type]', 'Output format')
  .arguments('<firstConfig>')
  .arguments('<secondConfig>');

program.parse(process.argv);
