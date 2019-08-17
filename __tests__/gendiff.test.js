import fs from 'fs';
import { resolve, join } from 'path';
import gendiff from '../src';

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);

describe('Gendiff tests', () => {
  const fixturesDirPath = buildAbsDirPath('__fixtures__');
  const buildFilePath = buildFilePathInDir(fixturesDirPath);
  const buildFilePathsArr = (...fileNames) => [...fileNames].map(buildFilePath);

  test.each([
    buildFilePathsArr('before.json', 'after.json', 'result'),
    buildFilePathsArr('before.yml', 'after.yml', 'result'),
    buildFilePathsArr('before.ini', 'after.ini', 'result'),
  ])(
    'test %#',
    (fileBeforePath, fileAfterPath, fileDiffPath) => {
      const result = gendiff(fileBeforePath, fileAfterPath);
      const expected = fs.readFileSync(fileDiffPath, 'utf8');
      expect(result).toBe(expected);
    },
  );
});
