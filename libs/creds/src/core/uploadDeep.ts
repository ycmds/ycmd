import { existsSync } from 'node:fs';

import { Err } from '@lsk4/err';
import { ILogger } from '@lsk4/log';
import { map, mapSeries } from 'fishbird';

import { getDirs } from '../utils/getDirs';
import { log } from '../utils/log';
import { upload } from './upload';

type UploadDeepOptions = {
  buildDir?: string;
  log?: ILogger;
  force?: boolean;
};

export async function uploadDeep(dirname: string, options: UploadDeepOptions = {}) {
  const rawFiles = await getDirs(dirname);
  const files = (
    await map(rawFiles, async (rawFile: any) => {
      const { filename } = rawFile;
      if (!(await existsSync(`${filename}/config.js`))) return null;
      return rawFile;
    })
  ).filter(Boolean);
  return mapSeries(files, async ({ filename }) => {
    await upload(filename, options).catch((err) => {
      log.error(`Build error ${filename}: `, Err.getMessage(err));
      log.error(err);
    });
  });
}
