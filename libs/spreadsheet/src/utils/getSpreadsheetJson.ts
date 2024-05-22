/* eslint-disable no-param-reassign */
import { omitNull } from '@lsk4/algos';
import { parse } from 'csv-parse';
import dot from 'dot-object';

import { getSpreadsheetRaw } from './getSpreadsheetRaw.js';

export async function getSpreadsheetJson(
  url: string,
  {
    columns = true,
    nested = false,
    type = 'objects',
    filter = (a: any) => a,
    mapper = (a: any) => a,
    omitNull: isOmitNull = false,
    ...params
  } = {},
) {
  const spreadsheet = await getSpreadsheetRaw(url);
  return new Promise((resolve, reject) => {
    parse(spreadsheet, { columns, ...params }, (err: any, res: any) => {
      if (err) return reject(err);
      res = res.filter((item: any) => filter(item));
      if (nested) {
        res = res.map((item: any) => dot.object(item));
      }
      res = res.map((item: any) => mapper(item));
      if (isOmitNull) {
        res = res.map((item: any) => omitNull(item));
      }
      if (type === 'object') {
        // eslint-disable-next-line prefer-destructuring
        res = res[0];
      }
      return resolve(res);
    });
  });
}
