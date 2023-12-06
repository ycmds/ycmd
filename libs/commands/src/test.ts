// #!/usr/bin/env node
import { createCommand, isEnvSkip, pnpmRecursive, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'test [-w][-s]',
  describe: 'run tests',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, argv, log }) {
    if (isEnvSkip(['test', 'tests'])) {
      log.warn('SKIP_TEST');
      return;
    }
    if (isRoot) {
      // const env = {
      //   ...process.env,
      //   YCMD_SILENT: '1',
      //   YCMD_PROD: '1',
      // };
      await pnpmRecursive(`run test --silent`, { ctx, argv });
      return;
    }
    await shell('ycmd test:uvu', { ctx, argv });
    await shell('ycmd test:jest', { ctx, argv });
    await shell('ycmd test:eslint', { ctx, argv });
    await shell('ycmd test:size-limit', { ctx, argv });
  },
});
