import fs from 'fs';
import { resolve, join } from 'path';
import gendiff from '../src';
import { toPlainFormat } from '../src/formatters';

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);

describe('Gendiff tests', () => {
  const fixturesDirPath = buildAbsDirPath('__fixtures__');
  const buildFilePath = buildFilePathInDir(fixturesDirPath);
  const buildFilePathsArr = (fileNames) => fileNames.map(buildFilePath);

  test.each([
    ['before.json', 'after.json', 'result'],
    ['before.yml', 'after.yml', 'result'],
    ['before.ini', 'after.ini', 'result'],
    ['beforeDeep.json', 'afterDeep.json', 'resultDeep'],
    ['beforeDeep.yml', 'afterDeep.yml', 'resultDeep'],
    ['beforeDeep.ini', 'afterDeep.ini', 'resultDeep'],
  ].map(buildFilePathsArr))(
    'Test with json format: %#',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath);
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );

  test.each([
    ['before.json', 'after.json', 'result.plain'],
    ['before.yml', 'after.yml', 'result.plain'],
    ['before.ini', 'after.ini', 'result.plain'],
    ['beforeDeep.json', 'afterDeep.json', 'resultDeep.plain'],
    ['beforeDeep.yml', 'afterDeep.yml', 'resultDeep.plain'],
    ['beforeDeep.ini', 'afterDeep.ini', 'resultDeep.plain'],
  ].map(buildFilePathsArr))(
    'Test with plain format: %#',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath, toPlainFormat);
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );
});
