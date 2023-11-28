// #!/usr/bin/env node
import { createCommand, findBin, getCwdInfo, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'build:nest [-w]',
  describe: 'build NestJS project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, argv } = {}) {
    if (isRoot) {
      await shellParallel(`ycmd build:nest`, { ctx, argv });
      return;
    }
    const { watch: isWatch = false } = argv;
    const { isApp } = await getCwdInfo({ cwd });

    if (isApp && isWatch) {
      const cmd = `${findBin('nest')} start --watch --debug`;
      await shell(cmd, { ctx });
    } else {
      await shell('ycmd build:ts', { ctx, argv });
    }
  },
});
