// #!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createCommand, findBin, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions } from './utils/defaultOptions.js';

export default createCommand({
  command: 'test:eslint [--fix] [-s]',
  describe: 'run ESLint on the source files',
  builder: (yargs) =>
    yargs.options({
      silent: commonOptions.silent,
      fix: {
        describe: 'Automatically fix problems.',
        type: 'boolean',
        default: false,
      },
    }),
  async main({ isRoot, ctx, argv, log, cwd }) {
    if (isRoot) {
      await shellParallel('ycmd test:eslint', { ctx, argv });
      return;
    }
    const { silent: isSilent = defaultOptions.isSilent, fix: isFix = false } = argv;
    if (!existsSync(join(cwd, 'src'))) {
      log.debug('[skip] src folder not found - eslint skiped ');
      return;
    }
    let cmd = `${findBin('eslint')} src`;
    if (isSilent) cmd += ' --quiet';
    if (isFix) cmd += ' --fix';
    await shell(cmd, { ctx });
  },
});
