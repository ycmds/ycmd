// import { bundleRequire } from 'bundle-require'
import { loadConfig as loadConfigFile } from '@lsk4/config';

import type { LskrcConfig } from './types.js';

const cmdName = 'ycmd';
const exts = [`.config.ts`, `.config.js`, `.config.cjs`, `.config.mjs`, `.config.json`];

export async function loadConfig({
  cwd: initCwd,
  configFile,
}: {
  cwd?: string;
  configFile?: string;
} = {}): Promise<{ path?: string; config?: LskrcConfig }> {
  const cwd = initCwd || process.cwd();
  const files = configFile ? [configFile] : [];
  // @ts-ignore
  return loadConfigFile(`.${cmdName}`, { cwd, exts, files, throwError: false, silent: true });
}
