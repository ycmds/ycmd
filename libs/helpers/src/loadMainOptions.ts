// import { createLogger } from '@lsk4/log';
import { readFile } from 'node:fs/promises';

import { tryJSONparse } from '@lsk4/env';
import { getCwdInfo, joinArgs, loadConfig, log } from '@ycmd/utils';

import { MainOptions } from './types';

// export const log = createLogger({ ns: 'cli' });

// const defaultConfig = {
//   scripts: ['src/index.ts'],
// }

const getCmdName = (a: string) => a.split('/').reverse()[0].split('.')[0];
const getCmdPackageJsonPath = (a: string) =>
  `${a.split('/').reverse().slice(2).reverse().join('/')}/package.json`;
// const cmdName = 'ycmd';

export async function loadMainOptions({ cwd = process.cwd() } = {}): Promise<MainOptions> {
  const [nodeBin, ycmdBin, ...args] = process.argv;

  const [cwdInfo, loadedConfig, rawPackageJson] = await Promise.all([
    getCwdInfo({ cwd }),
    loadConfig({ cwd, default: true }),
    readFile(getCmdPackageJsonPath(ycmdBin))
      .then((a) => a.toString())
      .catch(() => '{}'),
  ]);
  const { path: configPath, config = {} } = loadedConfig;
  const cmdPackage = tryJSONparse(rawPackageJson);
  const cmdVersion = cmdPackage?.version;
  const cmdName = cmdPackage?.name || getCmdName(ycmdBin);

  // console.log({ cwd, cwdInfo });
  // TODO: может наследовать логгер?
  // const log = initLogger || createLogger({ name: packageName });
  // const proc = process as LskrunProcess;
  // const [shell, filename, ...args] = proc.argv;
  // const config = getLskConfig();
  // console.log({ config });
  // const argv = process.argv;
  const ctx = {
    stack: [
      {
        command: `${cmdName} ${joinArgs(args)}`,
        // log,
      },
    ],
  };
  return {
    startedAt: new Date(),

    cwd,
    cwdInfo,
    isRoot: cwdInfo.isRoot,
    configPath,
    config,
    log,

    ctx,

    cmdName,
    cmdVersion,
    cmdPackage,
    nodeBin,
    ycmdBin,
    args,
    argv: {
      unexpected: 1,
    }, // TODO: парсить?
  };
}
