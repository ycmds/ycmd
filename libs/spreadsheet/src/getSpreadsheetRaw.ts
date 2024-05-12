/* eslint-disable prefer-regex-literals */
import axios from 'axios';

import { getFileWithAuth } from './getFileWithAuth.js';
import { log } from './log.js';

export async function getSpreadsheetRaw(url: string) {
  try {
    const s = new RegExp('/spreadsheets/d/([a-zA-Z0-9-_]+)').exec(url);
    let spreadsheetId;
    if (s) {
      // eslint-disable-next-line prefer-destructuring
      spreadsheetId = s[1];
    } else {
      throw new Error('invalid url');
    }
    const sh = new RegExp('[#&]gid=([0-9]+)').exec(url);
    let sheetId;
    if (sh) {
      // eslint-disable-next-line prefer-destructuring
      sheetId = sh[1];
    } else {
      throw new Error('invalid gid');
    }
    const exportURL = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?gid=${sheetId}&format=csv`;
    const response = await axios(exportURL, {
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 401;
      },
    });
    let { data } = response;
    if (response.status === 401) {
      // log.debug('need auth');
      // sheetId
      data = await getFileWithAuth(spreadsheetId, +sheetId || 0);
    }
    return data;
  } catch (err: any) {
    if (err?.statusCode === '404') {
      log.info('File not found');
    } else {
      log.error('err', err);
    }
    throw err;
  }
}
