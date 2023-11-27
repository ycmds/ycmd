import { getLskConfig, joinArgs, log } from '@ycmd/utils';
import path from 'path';

import type { LskrunProcess } from './types.js';
import { RootRun } from './types.js';

export const getMainOptions = () => {
  const proc = process as LskrunProcess;
  const [shell, filename, ...args] = proc.argv;
  const config = getLskConfig();
  const cwd = proc.cwd();
  const ctx = {
    stack: [
      {
        command: `lsk ${joinArgs(args)}`,
        log,
      },
    ],
  };
  return {
    startedAt: new Date(),
    shell,
    filename,
    args,
    cwd,
    isRoot: Boolean(config?.path && path.dirname(config?.path) === cwd),
    config,
    log,
    ctx,
  } as RootRun;
};
