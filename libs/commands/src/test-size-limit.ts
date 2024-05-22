// #!/usr/bin/env node

import { join } from 'node:path';

import { Err } from '@lsk4/err';
import { map } from 'fishbird';
import { createCommand, isFileExist, readJson, shell, shellParallel } from 'ycmd';

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
    const ups = Array.from({ length: 10 }).map((_, i) => '/..'.repeat(i).substr(1));
    const bins = await map(ups, async (up) => {
      const sizeLimitBin = join(__dirname, up, 'node_modules', 'size-limit', 'bin.js');
      const isExist = await isFileExist(sizeLimitBin);
      if (isExist) return sizeLimitBin;
      return null;
    });
    const sizeLimitBin = bins.filter(Boolean)[0];
    if (!sizeLimitBin) {
      throw new Err(`size-limit not found in node_modules`);
    }
    // console.log({ sizeLimitRun });
    // const raw = await import(sizeLimitRun);
    // const content = raw?.default || raw;

    // console.log('sizeLimitDir', sizeLimitDir);

    // const isProd = !isDev || !!+process.env.YCMD_PROD || argv.prod;
    const isSilent = !!+process.env.YCMD_SILENT || argv.silent || defaultOptions.isSilent;
    // let cmd = findBin('size-limit');
    const cmd = sizeLimitBin;
    // if (isProd || isSilent) cmd += ' --silent';
    // const args = [];

    // if (isSilent) {
    //   cmd += ' --silent --json';
    //   // args.push('--silent');
    // }
    // const res = await content({
    //   ...process,
    //   cwd() {
    //     return cwd;
    //   },
    //   argv: args,
    // });
    // console.log({ content, cmd, res });
    if (isSilent) {
      await shell(`${cmd} --silent`, { ctx, silence: isSilent ? 'all' : false }).catch(async () => {
        log.error('Error while running', cmd);
        await shell(cmd, { ctx });
      });
    } else {
      await shell(cmd, { ctx });
    }
  },
});

export default main;
