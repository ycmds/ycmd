import { Err } from '@lsk4/err';

import { shell } from './shell.js';
import type { ShellParallelOptions } from './types.js';

export function pnpmRecursive(command: string, options: ShellParallelOptions = {}): Promise<any> {
  const cmd = command;
  const npmClient = options.npmClient || 'pnpm';
  // console.log('[pnpmRecursive]', { command, options });
  if (npmClient === 'pnpm') {
    const concurrency = process.env.PNPM_CONCURRENCY || 4;
    let args = concurrency && concurrency !== 4 ? ` --workspace-concurrency=${concurrency}` : '';
    if (options.parallel) args += ' --parallel';
    return shell(`pnpm -r${args} ${cmd}`, options);
  }
  throw new Err('LSK_NPM_CLIENT', `Unknown npmClient: ${npmClient}`, {
    command,
    options,
    cmd,
  });
}
