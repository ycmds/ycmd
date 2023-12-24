// #!/usr/bin/env node
import { createCommand, pnpmRecursive, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions';

export default createCommand({
  command: 'dev',
  describe: 'run development tasks',

  builder: (yargs) =>
    yargs.options({
      prod: commonOptions.prod,
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ argv, isRoot, ctx }) {
    if (isRoot) {
      await pnpmRecursive(`run dev`, { ctx, argv: { silent: true } });
      return;
    }
    // TODO: args to argv
    await shell('ycmd build', { ctx, argv: { ...argv, watch: true } });
  },
});
