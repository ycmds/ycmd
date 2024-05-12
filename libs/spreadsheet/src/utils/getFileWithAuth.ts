import { Err } from '@lsk4/err';
import { google } from 'googleapis';
import { json2csv } from 'json-2-csv';

import { authOnce } from './auth.js';

export async function getFileWithAuth(spreadsheetId: string, sheetId = 0) {
  const token = await authOnce();
  const sheets: any = google.sheets({
    version: 'v4',
    auth: token,
  });
  if (!sheets) throw new Err('!sheets');

  const spreadSheetResult = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  const sheetsArray = spreadSheetResult?.data?.sheets;
  if (!sheetsArray) throw new Err('!sheets');
  const range = sheetsArray.find(
    (sheet: any) => String(sheet.properties.sheetId) === String(sheetId),
  );
  if (!range) throw new Err('!range');
  const rangeTitle = range.properties.title;
  const result: any = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: rangeTitle,
  });
  const csv = json2csv(result.data.values, {
    emptyFieldValue: '',
    prependHeader: false,
  });
  return csv;
}
