// import { bundleRequire } from 'bundle-require'
import { join, relative } from 'node:path';

import { loadConfig as loadConfigFile } from '@lsk4/config';

import { findMonorepoRoot } from './findMonorepoRoot.js';
// import { log } from './log.js';
import type { LskrcConfig } from './types.js';
import { uniq } from './uniq.js';

const cmdName = 'ycmd';
const exts = [`.config.ts`, `.config.js`, `.config.cjs`, `.config.mjs`, `.config.json`];

export const loadDefaultConfig = async ({ cwd: initCwd }: { cwd?: string }) => {
  const cwd = initCwd || process.cwd();
  const monorepoRoot = await findMonorepoRoot();
  const raw = [
    join(cwd, 'scripts'),
    join(cwd, 'node_modules', 'ycmd', 'scripts'),
    ...(monorepoRoot
      ? [
          //
          join(monorepoRoot, 'scripts'),
          join(monorepoRoot, 'node_modules', 'ycmd', 'scripts'),
        ]
      : []),
  ];
  const scripts = uniq(raw)
    .filter(Boolean)
    .map((p) => relative(cwd, p));
  // log.trace('[cwd]', cwd);
  // log.trace('[raw]', raw);
  // log.trace('[monorepoRoot]', monorepoRoot);
  // log.trace('[scripts]', scripts);
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
        ...(await loadDefaultConfig({ cwd })),
      },
    };
  }
  // console.log({ defaultConfig, config });
  if (isDefault) {
    return {
      path,
      config: {
        ...(await loadDefaultConfig({ cwd })),
        ...config,
      },
    };
  }
  return { path, config };
}
