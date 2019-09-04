import { extname } from 'path';
import { readFileSync } from 'fs';

const getFormat = (filePath) => extname(filePath).slice(1);
const getData = (pathToFile) => readFileSync(pathToFile, 'utf8');

export { getFormat, getData };
