import fs from 'fs';
import { resolve } from 'path';
import gendiff from '../src';

test('test1', () => {
  const fileBeforePath = resolve(__dirname, '__fixtures__', 'before.json');
  const fileAfterPath = resolve(__dirname, '__fixtures__', 'after.json');
  const resultPath = resolve(__dirname, '__fixtures__', 'result');

  const expected = fs.readFileSync(resultPath, 'utf8');
  const result = gendiff(fileBeforePath, fileAfterPath);
  expect(result).toBe(expected);
});
