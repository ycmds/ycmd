/* eslint-disable camelcase */
import { createInterface } from 'node:readline/promises';

// import { set } from '@lsk4/algos';
import { Err } from '@lsk4/err';
// import { jsonToFile } from '@lsk4/stringify';
import { delay } from 'fishbird';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { loadConfig } from './loadConfig.js';
import { log } from './log.js';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

// export const setLskConfig = async (key: string, value: any, { path }: any = {}) => {
//   const cwd = process.cwd();
//   // eslint-disable-next-line no-param-reassign
//   if (!path) path = `${cwd}/.lskjs.js`;
//   let config = {};
//   log.debug(`${path}`, key, value);
//   try {
//     // eslint-disable-next-line import/no-dynamic-require
//     config = require(`${path}`);
//   } catch (err) {
//     log.error('[setLskConfig]', err);
//     config = {};
//   }
//   set(config, key, value);
//   await jsonToFile(`${path}`, config, { type: 'js' });
// };

export const saveToken = async (path: string, token: any) => {
  log.info('======= Please save the token in file by yourself, then start script again =========');
  log.info('Filename', path);
  log.info('Field', 'spreadsheet.token');
  log.info('Value', token);
  log.info('======= Please save the token in file by yourself, then start script again =========');
};

// 1. open google cloud
// 2. create app with oAutg 2.0 Client ID for Desktop
// 3. copy creds in .lskjs.js .spreadsheet.app

export async function auth(): Promise<OAuth2Client> {
  const { path, config } = await loadConfig();
  if (!config?.spreadsheet?.app) {
    throw new Err('!config.spreadsheet.app');
  }
  const { client_secret, client_id, redirect_uris } = config?.spreadsheet?.app || {};
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = config?.spreadsheet?.token;
  if (!token) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    log.warn('Authorize this app by visiting this url:\n\n', authUrl, '\n\n');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const code = await rl.question('Enter the code from that page here: ');
    const { tokens } = await oAuth2Client.getToken(code);
    const token2 = tokens;
    const guessPath = `${process.cwd()}/.ycmd.config.json`;
    await saveToken(path || guessPath, token2);
    process.exit();
  }
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

let authOnceCache: OAuth2Client;
let authOnceCacheStartedAt: Date;
let authOnceCacheDate: Date;
export async function authOnce(): Promise<OAuth2Client> {
  if (authOnceCache && Date.now() - +authOnceCacheDate < 1000 * 60) return authOnceCache;
  if (authOnceCache) return authOnceCache;
  if (authOnceCacheStartedAt) {
    await delay(1000 * 60 * 10);
    return authOnce();
  }
  authOnceCacheStartedAt = new Date();
  const res = await auth();
  authOnceCache = res;
  authOnceCacheDate = new Date();
  return res;
}
