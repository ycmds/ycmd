#!/usr/bin/env node

import { createCli } from '@ycmd/helpers';
import { findCommands } from '@ycmd/run';
import { CommandModule } from 'yargs';

createCli({
  name: 'ycmd',
  commands: findCommands({
    exts: ['.sh', '.js', '.cjs', '.mjs', '.ts', '.cts', '.mts'],
    nodemodules: true,
    local: true,
  }).then((cmds: any) => [...cmds] as CommandModule[]),
});
