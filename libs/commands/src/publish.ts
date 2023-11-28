// #!/usr/bin/env node
import { createCommand, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'publish [-d]',
  describe: 'publish the package',
  builder: (yargs) =>
    yargs.options({
      dry: commonOptions.dry,
    }),
  async main({ isRoot, ctx, argv } = {}) {
    if (isRoot) {
      await shellParallel('ycmd publish', { ctx, argv });
      return;
    }
    const { dry: isDryRun } = argv;
    let cmd = 'pnpm publish .release --no-git-checks';
    if (isDryRun) cmd += ' --dry-run';
    await shell(cmd, { ctx });
  },
});
