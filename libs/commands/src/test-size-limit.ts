// #!/usr/bin/env node

import { join } from 'node:path';

import { createCommand, readJson, shell, shellParallel } from 'ycmd';

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
      log.debug('[skip] size-limit rc not found - size-limit skiped');
      return;
    }

    // console.log('__dirname', __dirname);
    const sizeLimitDir = join(__dirname, '../node_modules', 'size-limit');
    // const sizeLimitRun = join(sizeLimitDir, 'run.js');
    const sizeLimitBin = join(sizeLimitDir, 'bin.js');
    // console.log({ sizeLimitRun });
    // const raw = await import(sizeLimitRun);
    // const content = raw?.default || raw;

    // console.log('sizeLimitDir', sizeLimitDir);

    // const isProd = !isDev || !!+process.env.YCMD_PROD || argv.prod;
    const isSilent = !!+process.env.YCMD_SILENT || argv.silent || defaultOptions.isSilent;
    // let cmd = findBin('size-limit');
    let cmd = sizeLimitBin;
    // if (isProd || isSilent) cmd += ' --silent';
    const args = [];

    if (isSilent) {
      cmd += ' --silent';
      args.push('--silent');
    }
    // const res = await content({
    //   ...process,
    //   cwd() {
    //     return cwd;
    //   },
    //   argv: args,
    // });
    // console.log({ content, cmd, res });
    await shell(cmd, { ctx });
  },
});

export default main;
