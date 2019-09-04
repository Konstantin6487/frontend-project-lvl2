import { resolve, join } from 'path';
import { getFormat, getData } from '../src/helpers';
import gendiff from '../src';

const testCasesFiles = [
  ['before.json', 'after.json', 'result.diffjson'],
  ['before.yml', 'after.yml', 'result.plain'],
  ['before.ini', 'after.ini', 'result.json'],
];

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);

describe('Gendiff tests', () => {
  const fixturesDirPath = buildAbsDirPath('__fixtures__');
  const buildFilePath = buildFilePathInDir(fixturesDirPath);
  const buildFilePaths = (fileNames) => fileNames.map(buildFilePath);

  test.each(testCasesFiles.map(buildFilePaths))(
    "generate correct file's diff N%#",
    (beforeFilePath, afterFilePath, resultFilePath) => {
      const diffFormat = getFormat(resultFilePath);
      const result = gendiff(beforeFilePath, afterFilePath, diffFormat);
      const expected = getData(resultFilePath);

      expect(result).toBe(expected);
    },
  );
});
