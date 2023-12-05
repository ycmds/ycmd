// #!/usr/bin/env node

import { join } from 'node:path';

import { createCommand, findBin, readJson, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions } from './utils/defaultOptions.js';

const main = createCommand({
  command: 'test:size-limit [-s]',
  describe: 'check size of your JS files',
  builder: (yargs) =>
    yargs.options({
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, argv, cwd, log }) {
    if (isRoot) {
      await shellParallel('ycmd test:size-limit', { ctx, argv });
      return;
    }

    const filename = join(cwd, 'package.json');
    const packageJson = await readJson(filename);
    if (!packageJson['size-limit']) {
      log.debug('[skip] size-limit rc not found');
      return;
    }

    // const isProd = !isDev || !!+process.env.YCMD_PROD || argv.prod;
    const isSilent = !!+process.env.YCMD_SILENT || argv.silent || defaultOptions.isSilent;
    let cmd = findBin('size-limit');
    // if (isProd || isSilent) cmd += ' --silent';
    if (isSilent) cmd += ' --silent';
    await shell(cmd, { ctx });
  },
});

export default main;
