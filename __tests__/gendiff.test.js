import fs from 'fs';
import { resolve, join } from 'path';
import gendiff from '../src';

const fixturesFolderPath = resolve(__dirname, '__fixtures__');
const getFilePath = (fileName) => join(fixturesFolderPath, fileName);

test('test1: .json files', () => {
  const fileBeforePath = getFilePath('before.json');
  const fileAfterPath = getFilePath('after.json');
  const resultPath = getFilePath('result');

  const expected = fs.readFileSync(resultPath, 'utf8');
  const result = gendiff(fileBeforePath, fileAfterPath);
  expect(result).toBe(expected);
});

test('test2: .yml files', () => {
  const fileBeforePath = getFilePath('before.yml');
  const fileAfterPath = getFilePath('after.yml');
  const resultPath = getFilePath('result');

  const expected = fs.readFileSync(resultPath, 'utf8');
  const result = gendiff(fileBeforePath, fileAfterPath);
  expect(result).toBe(expected);
});
