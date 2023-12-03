/* eslint-disable no-console */

import { join } from 'node:path';

import { filter } from 'fishbird';

import { isFileExist } from './isFileExist.js';
import { CwdParams } from './types.js';

export async function findFileUp(
  name: string | string[],
  options: CwdParams = { cwd: process.cwd() },
): Promise<string | null> {
  const filenames = Array.isArray(name) ? name : [name];
  let { cwd: dir = process.cwd() } = options;

  // TODO: подумать может распараллелить
  while (dir !== '/') {
    // eslint-disable-next-line no-loop-func
    const paths = filenames.map((f) => join(dir, f));

    // eslint-disable-next-line no-await-in-loop
    const existsPaths = await filter(paths, isFileExist);
    // eslint-disable-next-line no-await-in-loop
    // console.log('[while]', { dir, filenames, paths, existsPaths }, await isFileExist(paths[0]));

    if (existsPaths.length) return existsPaths[0];
    // eslint-disable-next-line no-param-reassign
    dir = join(dir, '..');
  }
  return null;
}
