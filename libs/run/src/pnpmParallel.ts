import { Err } from '@lsk4/err';

import { shell } from './shell.js';
import type { ShellParallelOptions } from './types.js';

export function pnpmParallel(command: string, options: ShellParallelOptions = {}): Promise<any> {
  const cmd = command;
  const npmClient = options.npmClient || 'pnpm';
  if (npmClient === 'pnpm') {
    const concurrency = process.env.PNPM_CONCURRENCY || 4;
    const cc = concurrency && concurrency !== 4 ? ` --workspace-concurrency=${concurrency}` : '';
    return shell(`pnpm -r${cc} --parallel ${cmd}`, options);
  }
  throw new Err('LSK_NPM_CLIENT', `Unknown npmClient: ${npmClient}`, {
    command,
    options,
    cmd,
  });
}
