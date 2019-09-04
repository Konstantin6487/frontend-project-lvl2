import { resolve, join } from 'path';
import { getFormat, getData } from '../src/helpers';
import gendiff from '../src';

const testCasesFiles = [
  ['original.json', 'newest.json', 'diff.diffjson'],
  ['original.yml', 'newest.yml', 'diff.plain'],
  ['original.ini', 'newest.ini', 'diff.json'],
];

const buildAbsDirPath = (dirName) => resolve(__dirname, dirName);
const buildFilePathInDir = (dirPath) => (fileName) => join(dirPath, fileName);

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
