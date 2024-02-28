import fs from 'node:fs/promises';

import { Err } from '@lsk4/err';
import { ILogger } from '@lsk4/log';
import axios from 'axios';
import { map } from 'fishbird';

import { ServiceOptions } from '../services/types';
import { log as defaultLog } from './log';

type DownloadOptions = ServiceOptions & {
  log?: ILogger;
};

export async function download(dir: string, { force, ...options }: DownloadOptions = {}) {
  const log = options.log || defaultLog;
  if (force) {
    // TODO: something
  }
  let config;
  try {
    // eslint-disable-next-line import/no-dynamic-require
    config = require(`${dir}/__config.js`);
  } catch (err) {
    console.error('err', err);
    config = {};
  }
  const service = options.service || config.service;
  if (service === 'github') {
    throw new Err('Downloading secrets from github is not supported');
  }

  const server = options.server || config.server;
  const id = options.id || config.id;
  const token = options.token || config.token;
  const projectName = options.project || config.project;
  const url = `https://${server}/api/v4/projects/${id}/variables`;

  const { data: variables } = await axios({
    method: 'get',
    url,
    headers: {
      'PRIVATE-TOKEN': token,
    },
  });

  await map(variables, async ({ key, value, variable_type: type }) => {
    try {
      if (type !== 'file') {
        log.warn(`[IGNORE] Project ${projectName} ${key}`);
        return;
      }
      let ext;
      if (key.endsWith('env_file')) {
        ext = 'env';
      } else if (key.endsWith('env_json')) {
        ext = 'json';
      } else if (key.endsWith('env_js')) {
        ext = 'js';
      }
      const file = [key, ext].filter(Boolean).join('.');
      const filename = `${dir}/${file}`;
      await fs.writeFile(filename, value);
      log.info(`[OK] ${server}/${projectName} (${key}) => ${dir}/${file}`);
    } catch (err: any) {
      log.error(
        `[ERR] Project ${projectName} ${key}`,
        Err.getMessage(err?.response?.data?.message || err),
      );
    }
  });
}
