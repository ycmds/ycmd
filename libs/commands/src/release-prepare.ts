// #!/usr/bin/env node
import { pick } from '@lsk4/algos';
import { createCommand, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'release:prepare [-y][-p][-s][-d]',
  describe: 'run release process',
  builder: (yargs) =>
    yargs.options({
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      'skip-test': {
        type: 'boolean',
        describe: 'skip test',
        default: false,
      },
    }),

  // meta: import.meta,
  async main({ ctx, argv: initArgv, isRoot, log } = {}) {
    const argv = pick(initArgv, ['prod', 'silent']);

    const isSkipBuild = false;
    const { 'skip-test': isSkipTest } = initArgv;
    if (isRoot) {
      log.warn('skip');
      return;
    }
    if (!isSkipBuild) await shell('pnpm run build', { ctx, argv });
    if (!isSkipTest) await shell('pnpm run test', { ctx, argv });
    await shell('ycmd prepack', { ctx, argv });
  },
});
