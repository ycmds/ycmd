// import { bundleRequire } from 'bundle-require'
import { loadConfig as loadConfigFile } from '@lsk4/config';
import { join } from 'path';

import { findMonorepoRoot } from './findMonorepoRoot.js';
import type { LskrcConfig } from './types.js';

const cmdName = 'ycmd';
const exts = [`.config.ts`, `.config.js`, `.config.cjs`, `.config.mjs`, `.config.json`];
const uniq = <T>(arr: T[]) => Array.from(new Set(arr));

export const loadDefaultConfig = async ({ cwd: initCwd }: { cwd?: string }) => {
  const cwd = initCwd || process.cwd();
  const monorepoRoot = await findMonorepoRoot();
  const scripts = uniq([
    join(cwd, 'node_modules', 'ycmd', 'scripts'),
    join(cwd, 'scripts'),
    ...(monorepoRoot
      ? [join(monorepoRoot, 'node_modules', 'ycmd', 'scripts'), join(monorepoRoot, 'scripts')]
      : []),
  ]).filter(Boolean);
  return { scripts };
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
        __from__: '__defaultConfig__',
        ...loadDefaultConfig({ cwd }),
      },
    };
  }
  // console.log({ defaultConfig, config });
  if (isDefault) {
    return {
      path,
      config: {
        ...loadDefaultConfig({ cwd }),
        ...config,
      },
    };
  }
  return { path, config };
}
