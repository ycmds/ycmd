import { resolve } from 'node:path';

import { toArray } from './toArray.js';

export const resolvePaths = async (paths: string[] | string, { cwd }: { cwd?: string } = {}) =>
  toArray(paths).map((p) => {
    if (p.startsWith('~')) {
      return p.replace('~', process.env.HOME || '');
    }
    return resolve(cwd || process.cwd(), p);
  });
