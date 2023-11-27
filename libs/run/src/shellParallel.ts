import { Err } from '@lsk4/err';

import { pnpmRecursive } from './pnpmRecursive.js';
import { ShellParallelOptions } from './types.js';

export function shellParallel(command: string, options: ShellParallelOptions = {}): Promise<any> {
  const cmd = command;
  const npmClient = options.npmClient || 'pnpm';
  // if (npmClient === 'lerna') {
  //   if (options.args) cmd += ` ${joinArgs(options.args)}`;
  //   return lernaParallel(
  //     `exec ${options.noPrefix ? '--no-prefix' : ''} -- ${cmd}`
  //   );
  // }

  if (npmClient === 'pnpm') {
    return pnpmRecursive(`exec ${cmd}`, options);
  }
  // if (npmClient === 'pnpm-api') {
  //   const params = [
  //     ...command.split(' ').filter(Boolean),
  //     ...(options.args || []),
  //   ];
  //   const { selectedProjectsGraph } = await readProjects(process.cwd(), []);
  //   const res = await exec.handler(
  //     {
  //       dir: process.cwd(),
  //       recursive: true,
  //       selectedProjectsGraph,
  //       extraBinPaths: [],
  //     },
  //     params
  //   );
  //   return res;
  // }

  throw new Err('LSK_NPM_CLIENT', `Unknown npmClient: ${npmClient}`, {
    command,
    options,
    cmd,
  });
}
