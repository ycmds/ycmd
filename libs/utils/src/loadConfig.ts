// import { bundleRequire } from 'bundle-require'
import { loadConfig as loadConfigFile } from '@lsk4/config';

import type { LskrcConfig } from './types.js';

const cmdName = 'ycmd';
const exts = [`.config.ts`, `.config.js`, `.config.cjs`, `.config.mjs`, `.config.json`];
export const defaultConfig = {
  scripts: [
    './scripts',
    './node_modules/ycmd/scripts',
    // '../scripts',
    // '../node_modules/ycmd/scripts',
    // '../../scripts',
    // '../../node_modules/ycmd/scripts',
  ],
};

export async function loadConfig({
  cwd: initCwd,
  configFile,
  default: isDefault,
}: {
  cwd?: string;
  configFile?: string;
  default?: boolean;
} = {}): Promise<{ path?: string; config?: LskrcConfig }> {
  const cwd = initCwd || process.cwd();
  const files = configFile ? [configFile] : [];

  const { path, config } = await loadConfigFile<LskrcConfig>(`.${cmdName}`, {
    cwd,
    exts,
    files,
    throwError: false,
    silent: true,
    packageKey: cmdName,
  });

  if (!path && isDefault) {
    // console.log({ isDefault, defaultConfig });
    return {
      path: undefined,
      config: {
        from: 'defaultConfig',
        ...defaultConfig,
      },
    };
  }
  // console.log({ defaultConfig, config });
  if (isDefault) {
    return {
      path,
      config: {
        ...defaultConfig,
        ...config,
      },
    };
  }
  return { path, config };
}
