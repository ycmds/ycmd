// #!/usr/bin/env node
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { createCommand, findBin, readJson, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions } from './utils/defaultOptions.js';

export default createCommand({
  command: 'test:uvu [-w][-s][-b]',
  describe: 'run Uvu tests on the project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      silent: commonOptions.silent,
      bail: commonOptions.bail,
    }),
  async main({ isRoot, ctx, argv, cwd, log }) {
    if (isRoot) {
      await shellParallel('ycmd test:uvu', { ctx, argv });
      return;
    }

    const filename = join(cwd, 'package.json');
    const packageJson = (await readJson(filename)) as any;
    const hasUvu = packageJson?.uvu || existsSync(join(cwd, 'tests'));
    if (!hasUvu) {
      log.debug('[skip] uvu rc in package.json or tests folder not found - uvu skiped');
      return;
    }

    const {
      // prod: isProd = !isDev,
      silent: isSilent = defaultOptions.isSilent,
      watch: isWatch = false,
      bail: isBail = defaultOptions.isBail,
    } = argv;

    let cmd = `${findBin('uvu')} tests -i fixtures`;
    const isTsm = true;
    if (isTsm) cmd += ' -r tsm';
    if (isSilent) {
      cmd += ' --quiet --silent';
    }
    if (isBail) cmd += ' --bail';
    if (isWatch) cmd = `watchlist src tests -- ${cmd}`;
    // await shell(cmd, { ctx });
    shell(cmd, { ctx, silence: isSilent ? 'all' : false }).catch(async (err) => {
      if (!isSilent) throw err;
      log.error('Error while running', cmd);
      await shell(cmd, { ctx });
    });
  },
});
