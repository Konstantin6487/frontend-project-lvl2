import { extname, join, resolve } from 'path';
import fs from 'fs';
import gendiff from '../src';

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);
const getFormat = (path) => extname(path).slice(1);
const getData = (path) => fs.readFileSync(path, 'utf8');

const testCasesFiles = [
  ['original.json', 'newest.json', 'diff.pretty'],
  ['original.yml', 'newest.yml', 'diff.plain'],
  ['original.ini', 'newest.ini', 'diff.json'],
];

describe('Gendiff tests', () => {
  const fixturesDirPath = buildAbsDirPath('__fixtures__');
  const buildFilePath = buildFilePathInDir(fixturesDirPath);
  const buildFilePaths = (fileNames) => fileNames.map(buildFilePath);

  test.each(testCasesFiles.map(buildFilePaths))(
    "generate correct file's diff N%#",
    (originalFilePath, newFilePath, diffFilePath) => {
      const diffFormat = getFormat(diffFilePath);
      const result = gendiff(originalFilePath, newFilePath, diffFormat);
      const expected = getData(diffFilePath);
      expect(result).toBe(expected);
    },
  );
});
