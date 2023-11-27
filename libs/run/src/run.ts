import { getLskConfig, joinArgs, log } from '@ycmd/utils';
import path from 'path';

import { MainFunction, MainOptions, PathexecProcess, RootRun } from './types.js';
/**
 * Это функция, обертка, которая позволяет запускать функцию main в разных сценариях.
 *
 * @param main
 * @returns
 */
export const run = async (main: MainFunction): Promise<{ main: MainFunction } | void> => {
  const proc = process as PathexecProcess;
  let isRootRun = false;
  if (!proc.pathexec?.rootRun) {
    isRootRun = true;
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
    const rootRun: RootRun = {
      shell,
      filename,
      args,
      cwd,
      isRoot: Boolean(config?.path && path.dirname(config?.path) === cwd),
      config,
      log,
      ctx,
    };
    proc.pathexec = { rootRun };
  }

  const runnable = (preprops: MainOptions = {}) => {
    const props = {
      ...(isRootRun ? proc.pathexec?.rootRun : {}),
      cwd: proc.pathexec?.rootRun?.cwd,
      config: proc.pathexec?.rootRun?.config,
      log: proc.pathexec?.rootRun?.log,
      ctx: proc.pathexec?.rootRun?.ctx,
      ...preprops,
    };

    return main(props).catch(() => {
      // Error handling logic...
      proc.exit(1);
    });
  };

  if (isRootRun) {
    const props: MainOptions = {
      rootRun: proc.pathexec.rootRun,
      args: proc.pathexec.rootRun.args,
    };
    console.log(123, runnable);

    try {
      console.log('runnable', runnable, props);

      const res = await runnable(props);
      console.log('res', res);

      return res;
    } catch (err) {
      console.log('[err]', err);
    }
    // return;
  }

  return { main: runnable };
};
