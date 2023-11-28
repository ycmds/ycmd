import { getLskConfig, joinArgs, log } from '@ycmd/utils';
import path from 'path';

import type { LskrunProcess } from './types.js';
import { RootRun } from './types.js';

const cmdName = 'ycmd';

export const getMainOptions = () => {
  const proc = process as LskrunProcess;
  const [shell, filename, ...args] = proc.argv;
  const config = getLskConfig();
  const cwd = proc.cwd();
  const ctx = {
    stack: [
      {
        command: `${cmdName} ${joinArgs(args)}`,
        log,
      },
    ],
  };
  // TODO: придумать как по другому искать корень
  const isRoot = Boolean(config?.path && path.dirname(config?.path) === cwd);
  // @ts-ignore
  // console.log({ isRoot, config, cwd, path: config?.path, dirname: path.dirname(config?.path) });

  // TODO: isRoot - from pnpm-workspace.yaml
  return {
    startedAt: new Date(),
    shell,
    filename,
    args,
    cwd,
    isRoot,
    config,
    log,
    ctx,
  } as RootRun;
};
