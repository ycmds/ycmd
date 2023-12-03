/* eslint-disable no-console */

import fs from 'node:fs';
import { resolve } from 'node:path';

import { getRootPath } from './getRootPath.js';
import { getShortPath } from './getShortPath.js';
import { log } from './log.js';
import { CwdParams, LskrcConfig } from './types.js';

const rcs: { [key: string]: LskrcConfig } = {};

const map = (a: any, b: any) => a.map(b);

export const getLskConfig = (options: CwdParams = { cwd: process.cwd() }): LskrcConfig => {
  const { cwd = process.cwd() } = options;

  const exts = ['js', 'cjs', 'mjs', 'json'];
  const names = ['.ycmd', '.lskjs'];

  const paths = map(
    names
      .map((name) =>
        exts.map((ext) => ({
          cwd,
          name,
          ext,
          path: resolve(`${cwd}/${name}.${ext}`),
        })),
      )
      .flat(),
    (path: any) => fs.existsSync(path),
  ).filter(Boolean);

  const path = paths[0];
  if (!path) return {};
  try {
    const raw = import(path);
    // const raw = require(path); // Note: Dynamic require might need special handling in TypeScript
    const config: LskrcConfig = { path, rootPath: getRootPath({ cwd: path }), ...raw };
    if (!rcs[path]) {
      rcs[path] = config;
      log.trace('[load] lskrc', getShortPath(path));
    }
    return config;
  } catch (error) {
    console.error(`parse .lskjs.js err ${path}`, error);
    return {};
  }
};
