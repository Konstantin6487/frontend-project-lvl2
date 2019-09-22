import { isEmpty } from 'lodash';

export default (ast) => (isEmpty(ast) ? '' : JSON.stringify(ast));
