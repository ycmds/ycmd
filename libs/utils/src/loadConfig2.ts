import fs from 'fs';
import JoyCon from 'joycon';
import path from 'path';

// import { bundleRequire } from 'bundle-require'
import { jsoncParse } from './jsoncParse';
import type { LskrcConfig } from './types.js';

const joycon = new JoyCon();
const cmdName = 'ycmd';

const loadJson = async (filepath: string) => {
  try {
    return jsoncParse(await fs.promises.readFile(filepath, 'utf8'));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to parse ${path.relative(process.cwd(), filepath)}: ${error.message}`,
      );
    } else {
      throw error;
    }
  }
};

const jsonLoader = {
  test: /\.json$/,
  load(filepath: string) {
    return loadJson(filepath);
  },
};

joycon.addLoader(jsonLoader);

export async function loadConfig(
  // eslint-disable-next-line default-param-last
  { cwd }: { cwd: string } = { cwd: process.cwd() },
  configFile?: string,
): Promise<{ path?: string; data?: LskrcConfig }> {
  const configJoycon = new JoyCon();
  const configPath = await configJoycon.resolve({
    files: configFile
      ? [configFile]
      : [
          `${cmdName}.config.ts`,
          `${cmdName}.config.js`,
          `${cmdName}.config.cjs`,
          `${cmdName}.config.mjs`,
          `${cmdName}.config.json`,
          'package.json',
        ],
    cwd,
    stopDir: path.parse(cwd).root,
    packageKey: cmdName,
  });

  if (configPath) {
    if (configPath.endsWith('.json')) {
      let data = await loadJson(configPath);
      if (configPath.endsWith('package.json')) {
        data = data[cmdName];
      }
      if (data) {
        return { path: configPath, data };
      }
      return {};
    }

    const config = await import(configPath);
    // ({
    // const config = await bundleRequire({
    //   filepath: configPath,
    // })
    const raw = config; // config.mod
    // const raw = config;
    return {
      path: configPath,
      data: raw[cmdName] || raw.default || raw,
    };
  }

  return {};
}

export async function loadPkg(cwd: string, clearCache: boolean = false) {
  if (clearCache) {
    joycon.clearCache();
  }
  const { data } = await joycon.load(['package.json'], cwd, path.dirname(cwd));
  return data || {};
}

/*
 * Production deps should be excluded from the bundle
 */
export async function getProductionDeps(cwd: string, clearCache: boolean = false) {
  const data = await loadPkg(cwd, clearCache);

  const deps = Array.from(
    new Set([...Object.keys(data.dependencies || {}), ...Object.keys(data.peerDependencies || {})]),
  );

  return deps;
}

/**
 * Use this to determine if we should rebuild when package.json changes
 */
export async function getAllDepsHash(cwd: string) {
  const data = await loadPkg(cwd, true);

  return JSON.stringify({
    ...data.dependencies,
    ...data.peerDependencies,
    ...data.devDependencies,
  });
}
