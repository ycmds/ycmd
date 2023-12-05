// #!/usr/bin/env node
import { createCommand, findBin, shell, shellParallel } from 'ycmd';

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
  async main({ isRoot, ctx, argv }) {
    if (isRoot) {
      await shellParallel('ycmd test:uvu', { ctx, argv });
      return;
    }
    const {
      // prod: isProd = !isDev,
      silent: isSilent = defaultOptions.isSilent,
      watch: isWatch = false,
      bail: isBail = defaultOptions.isBail,
    } = argv;

    let cmd = `${findBin('uvu')} tests`;
    const isTsm = true;
    if (isTsm) cmd += ' -r tsm';
    if (
      // isProd ||
      isSilent
    )
      cmd += ' --quiet';
    if (isBail) cmd += ' --bail';
    if (isWatch) cmd = `watchlist src tests -- ${cmd}`;
    await shell(cmd, { ctx });
  },
});
