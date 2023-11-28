// #!/usr/bin/env node
import { createCommand, getCwdInfo, isEnvSkip, pnpmRecursive, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'build [-w][-p][-s][-e]',
  describe: 'build project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      exec: commonOptions.exec,
      dts: commonOptions.dts,
      dist: commonOptions.dist,
    }),

  // meta: import.meta,
  async main({ argv, isRoot, log, cwd, ctx } = {}) {
    if (isEnvSkip(['build', 'builds'])) {
      log.warn('SKIP_BUILD');
      return;
    }
    if (isRoot) {
      // const env = {
      //   YCMD_SILENT: '1',
      //   YCMD_PROD: '1',
      // };
      await pnpmRecursive(`run build --prod --silent`, { ctx, argv }); // NOTE: env
      return;
    }
    const { isJs, isTs, isNest, isBabel, isSwc } = await getCwdInfo({ cwd });
    if (isNest) {
      await shell(`ycmd build:nest`, { ctx, argv });
    } else if (isSwc) {
      await shell(`ycmd build:swc`, { ctx, argv });
    } else if (isBabel) {
      await shell(`ycmd build:babel`, { ctx, argv });
    } else if (isTs) {
      await shell(`ycmd build:ts`, { ctx, argv });
    } else if (isJs) {
      log.debug('[skip] no need to build js projects');
    } else {
      log.error('UNKNOWN TYPE');
    }
  },
});
