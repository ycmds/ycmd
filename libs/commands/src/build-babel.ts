// #!/usr/bin/env node
import { CreateCommandResult } from '@ycmd/run/types';
import { createCommand, findBin, getCwdInfo, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'build:babel [-w]',
  describe: 'build Babel project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      dist: commonOptions.dist,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, argv } = {}) {
    if (isRoot) {
      await shellParallel(`ycmd build:babel`, { ctx, argv });
      return;
    }
    const { watch: isWatch = false, dist: libDir = 'lib' } = argv;
    if (!isWatch) await shell(`rm -rf ${libDir}`, { ctx, silence: true });
    await shell(`mkdir -p ${libDir}`, { ctx, silence: true });

    const { isApp } = await getCwdInfo({ cwd });
    let cmd;
    if (isApp && isWatch) {
      cmd = findBin('babel-node');
      cmd += ' src';
    } else {
      cmd = findBin('babel');
      cmd += ` src --out-dir ${libDir} --source-maps true --extensions ".js,.jsx,.ts,.tsx" --copy-files`;
      if (isWatch) {
        cmd += ` --watch`;
      }
    }
    await shell(cmd, { ctx });
  },
}) as CreateCommandResult;
