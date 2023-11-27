import { InfoCommand, RunCommand } from '@ycmd/commands';
import { createCli } from '@ycmd/helpers';
import { findCommands } from '@ycmd/run';
import { CommandModule } from 'yargs';

export default createCli({
  name: 'ycmd',
  commands: findCommands({
    exts: ['.sh', '.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'],
    nodemodules: true,
    local: true,
  }).then(
    (cmds: any) =>
      [
        ///
        InfoCommand,
        RunCommand,
        ...cmds,
      ] as CommandModule[],
  ),
});
