import { argvToArgs } from '@ycmd/helpers';
import { spawn } from '@ycmd/spawn';

import { pathexec } from './pathexec.js';
import { ShellOptions } from './types.js';

export async function shell(command: string, options: ShellOptions = {}): Promise<any> {
  const { env, ...opt } = options;
  const cmdNames = ['lsk run', 'lsk', 'lsk4', 'ycmd'];
  const cmdName = cmdNames.find((name) => command.startsWith(`${name} `));
  if (cmdName) {
    // TODO: args to argv
    return pathexec(command.slice(`${cmdName} `.length), {
      ...options,
      cmdName,
    });
  }
  const { args: initArgs = [], argv, ...other } = options;

  // NOTE: временно
  // @ts-ignore
  const { silence } = options;
  let stdio: string | string[] = 'inherit';
  if (silence === 'all') {
    stdio = ['inherit', 'ignore', 'ignore'];
  } else if (silence) {
    stdio = ['inherit', 'ignore', 'inherit'];
  }
  const args = [...initArgs, ...argvToArgs(argv)];

  // TODO: перенести логи сюда
  // if (!silence) log.debug(`▶ ${command} ${joinArgs(args)}`);
  const res = await spawn(command, args, {
    shell: true,
    // NOTE: не знаю как прокинуть правильно это в TS'е
    // @ts-ignore
    stdio,
    // stdio: ['pipe', 'inherit', 'inherit'],
    ...other,
  });
  return res;
}
