import { existsSync } from 'node:fs';

import { Err } from '@lsk4/err';
import { ILogger } from '@lsk4/log';
import { map, mapSeries } from 'fishbird';

import { getDirs } from '../utils/getDirs.js';
import { log } from '../utils/log.js';
import { build } from './build.js';

type BuildDeepOptions = {
  buildDir?: string;
  log?: ILogger;
  force?: boolean;
};

export async function buildDeep(dirname: string, options: BuildDeepOptions = {}) {
  const rawFiles = await getDirs(dirname);
  const files = (
    await map(rawFiles, async (rawFile: any) => {
      const { filename } = rawFile;
      if (!(await existsSync(`${filename}/index.js`))) return null;
      return rawFile;
    })
  ).filter(Boolean);
  return mapSeries(files, async ({ filename }) => {
    await build(filename, options).catch((err) => {
      log.error(`Build error ${filename}: `, Err.getMessage(err));
      log.error(err);
    });
  });
}
