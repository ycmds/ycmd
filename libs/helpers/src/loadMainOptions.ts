// import { createLogger } from '@lsk4/log';
import { getCwdInfo, joinArgs, loadConfig, log } from '@ycmd/utils';

import { MainOptions } from './types';

// export const log = createLogger({ ns: 'cli' });

const getCmdName = (a: string) => a.split('/').reverse()[0].split('.')[0];
// const cmdName = 'ycmd';

export async function loadMainOptions({ cwd = process.cwd() } = {}): Promise<MainOptions> {
  const [nodeBin, ycmdBin, ...args] = process.argv;
  const cwdInfo = await getCwdInfo({ cwd });
  const config = await loadConfig({ cwd });
  const cmdName = getCmdName(ycmdBin);

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
    config,
    log,

    ctx,

    cmdName,
    nodeBin,
    ycmdBin,
    args,
    argv: {
      unexpected: 1,
    }, // TODO: парсить?
  };
}
