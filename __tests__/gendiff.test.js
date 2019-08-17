import fs from 'fs';
import { resolve, join } from 'path';
import gendiff from '../src';

const buildDirPath = (dirName) => resolve(__dirname, dirName);
const buildPathFromDir = (dirPath) => (fileName) => join(dirPath, fileName);

describe('Gendiff tests', () => {
  const fixturesDirPath = buildDirPath('__fixtures__');
  const buildPath = buildPathFromDir(fixturesDirPath);

  test('test1: .json files', () => {
    const fileBeforePath = buildPath('before.json');
    const fileAfterPath = buildPath('after.json');
    const resultPath = buildPath('result');

    const expected = fs.readFileSync(resultPath, 'utf8');
    const result = gendiff(fileBeforePath, fileAfterPath);
    expect(result).toBe(expected);
  });

  test('test2: .yml files', () => {
    const fileBeforePath = buildPath('before.yml');
    const fileAfterPath = buildPath('after.yml');
    const resultPath = buildPath('result');

    const expected = fs.readFileSync(resultPath, 'utf8');
    const result = gendiff(fileBeforePath, fileAfterPath);
    expect(result).toBe(expected);
  });
});
