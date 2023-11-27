import { Err } from '@lsk4/err';
import { argvToArgs } from '@ycmd/helpers';
import {
  createLogger,
  findPath,
  getPackageName,
  getPaths,
  getShortPath,
  isWorkspaceRoot,
  joinArgs,
  undefault,
} from '@ycmd/utils';

import { shell } from './shell.js';
import { PathexecOptions, PathexecProcess } from './types.js';

// pathexec some-script arg1 arg2 -- some bare args

// Execute some of node.js script from PATHS

// principles
// 1. if script is not found in paths - throw error

// 2. can run directly by path
// pathexec ./some-script arg1 arg2 -- some bare args

// command - script name that will find in paths and execute
// options.name  - name of package
// options.cwd - current working directory
// options.log || options.logger - logger
// TODO: --explain

export async function pathexec(command: string, options: PathexecOptions = {}): Promise<any> {
  const proc = process as PathexecProcess;
  const [script, ...initArgs] = command.trim().split(' ').filter(Boolean);
  const { argv = {} } = options;
  const args = [...initArgs, ...(options.args || []), ...argvToArgs(argv)];

  const cwd = options.cwd || proc.cwd();
  const ctx = options.ctx || proc.pathexec?.rootRun?.ctx || {};
  if (!ctx.stack) ctx.stack = [];
  const cmdName = options.cmdName || 'ycmd';
  const cmd = `${cmdName} ${command} ${joinArgs(args)}`;
  ctx.stack.unshift({ command: cmd, options });

  // NOTE: comment this
  // proc.env.pathexec = { cwd };
  const packageName = options.name || getPackageName({ cwd });
  const name = script.replace(/:/g, '-');
  const log =
    options.log ||
    createLogger({
      name: packageName,
    });
  const pathOptions = {
    name,
    exts: ['.sh', '.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'],
    nodemodules: 1,
    local: 1,

    script: name,
  };
  const scriptPath = findPath(pathOptions);
  // if (args.includes('--explain')) {
  //   cmd += ` (${getShortPath(scriptPath)})`;
  // }
  log.debug(`❯ ${cmd}`); // , { cwd }
  ctx.stack[0].filename = scriptPath;
  if (!scriptPath) {
    const errMessage = `Missing script: "${script}"`;
    throw new Err('LSKJS_MISSING_SCRIPT', errMessage, {
      data: {
        pathOptions,
        paths: getPaths(pathOptions),
      },
    });
  }
  let res;
  const ends = ['.sh', '.ts', '.cts', '.mts'];

  // eslint-disable-next-line no-useless-catch
  try {
    if (ends.some((end) => scriptPath.endsWith(end))) {
      log.trace(`❯❯ exec ${getShortPath(scriptPath)}`);
      res = await shell(`${scriptPath} ${args.join(' ')}`);
      return res;
    }

    log.trace(`❯❯ require ${getShortPath(scriptPath)}`);
    const content: any = undefault(await import(scriptPath));

    // TOOD: is command check
    let runnable;
    if (typeof content === 'function') {
      runnable = content;
    } else if (content?.run && typeof content.run === 'function') {
      runnable = content.run;
    } else if (content?.main && typeof content.main === 'function') {
      runnable = content.main;
    } else {
      log.warn(`[!incorrectExports] ${scriptPath}`);
      log.trace(`[!incorrectExports] ${scriptPath}`, { content });
      return null;
    }
    if (runnable) {
      res = await runnable({
        cwd,
        isRoot: isWorkspaceRoot({ cwd }),
        args,
        argv,
        options,
        ctx,
        log,
      });
    }
    ctx.stack.shift();
  } catch (err: any) {
    throw err;
  }
  return res;
}
