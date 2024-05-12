/* eslint-disable no-console */
import { Err } from '@lsk4/err';
import { getComment, guessFileFormat, jsonToFile } from '@lsk4/stringify';
import { addCwd } from '@ycmd/utils';

import { log as initLog } from '../log.js';
import type { FileFormat } from '../types.js';
import { getFileFormat } from '../utils/getFileFormat.js';
import { getSpreadsheetJson } from '../utils/getSpreadsheetJson.js';

export type Options = {
  out?: string;
  format?: FileFormat;
  type?: 'array' | 'objects' | 'object';
  nested?: boolean;
  mapper?: (a: any) => any;
  filter?: (a: any) => any;
};

export async function downloadAndSave(
  url: string,
  {
    out,
    format: initFileFormat,
    nested,
    type = 'objects',
    mapper = (a) => a,
    filter = (a) => a,
  }: Options = {},
  {
    cwd,
    log: paramLog,
  }: {
    cwd?: string;
    log?: any;
  } = {},
): Promise<any> {
  if (!url) throw new Err('emptyUrl', 'url is required');
  const format =
    // eslint-disable-next-line no-nested-ternary
    (initFileFormat ? getFileFormat(initFileFormat) : out ? guessFileFormat(out) : null) || 'json';
  const log = paramLog || initLog;
  if (url.indexOf('#') === -1) {
    // eslint-disable-next-line no-param-reassign
    url += '#gid=0';
  }
  // if (!out) {
  //   // eslint-disable-next-line no-param-reassign
  //   out = `spreadsheet.${format}`;
  // }
  // log.trace('options', url, out, filename, format);
  const columns = type === 'objects' || type === 'object';

  const res = await getSpreadsheetJson(url, {
    columns: Boolean(+columns),
    type,
    nested,
    mapper,
    filter,
  });

  if (!out) return res;
  if (out === 'STDOUT') {
    // eslint-disable-next-line no-lonely-if
    if (format === 'jsonEachRow' && Array.isArray(res)) {
      (res as any).forEach((row: any) => console.log(JSON.stringify(row)));
    } else {
      console.log(JSON.stringify(res));
    }
  } else {
    const filename = addCwd(out, { cwd });
    const options = {
      comment: getComment({
        name: out,
        url,
      }),
    } as any;
    if (format) options.format = format;
    const { status } = await jsonToFile(filename, res as any, options);
    log.debug(`[${status}]`, `${url} => ${out}`);
  }
  return res;
}

export default downloadAndSave;
