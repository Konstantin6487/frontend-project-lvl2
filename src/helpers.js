import { extname } from 'path';
import { readFileSync } from 'fs';

const getExtName = (filePath) => extname(filePath).slice(1);
const getData = (pathToFile) => readFileSync(pathToFile, 'utf8');

export { getExtName, getData };
