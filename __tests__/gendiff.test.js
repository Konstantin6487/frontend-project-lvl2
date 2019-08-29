import fs from 'fs';
import { resolve, join } from 'path';
import gendiff from '../src';

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);

describe('Gendiff tests', () => {
  const fixturesDirPath = buildAbsDirPath('__fixtures__');
  const buildFilePath = buildFilePathInDir(fixturesDirPath);
  const buildFilePathsArr = (fileNames) => fileNames.map(buildFilePath);

  test.each([['before.json', 'after.json', 'result.diffjson']]
    .map(buildFilePathsArr))(
    'Format diff output to "diffjson" format',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath);
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );

  test.each([['before.yml', 'after.yml', 'result.plain']]
    .map(buildFilePathsArr))(
    'Format diff output to "plain" format',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath, 'plain');
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );

  test.each([['before.ini', 'after.ini', 'result.json']]
    .map(buildFilePathsArr))(
    'Format diff output to "json" format',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath, 'json');
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );
});
