import type { CommandModule } from 'yargs';
import yargs from 'yargs';

import { createOnComplete } from './createOnComplete.js';
import { onFail } from './onFail.js';

export async function createCli({
  name,
  argv = process.argv.slice(2),
  commands: rawCommands = [],
}: {
  name?: string;
  argv?: string[];
  commands?: CommandModule[] | Promise<CommandModule[]>;
} = {}) {
  // @ts-ignore
  process.ycmdStartedAt = new Date();
  const commands = await rawCommands;
  // fideBin()
  const Yargs = yargs(argv)
    .scriptName(name || 'cli')
    .usage('Usage: $0 <command> [options]')
    .command(commands || [])
    .strict()
    .demandCommand()
    .alias('h', 'help')
    .help('h')
    .completion('completion', createOnComplete({ commands }));

  // TODO: проверять доку, когда такое появится официально
  Yargs.fail(onFail.bind(Yargs));
  if (argv.length === 0) {
    Yargs.showHelp();
  } else {
    Yargs.parse();
  }

  return Yargs;
}
