// #!/usr/bin/env node
import { join } from 'path';
import { createCommand, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'clean [-f]',
  describe: 'clean build artifacts',
  builder: (yargs) =>
    yargs.options({
      force: commonOptions.force,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, argv }) {
    if (isRoot) {
      await shellParallel('ycmd clean', { ctx, argv });
      // return;
    }
    const { force: isForce = false } = argv;
    const tempFiles = ['coverage', '.release', '.reports'];
    const forceFiles = ['node_modules', 'lib', 'cjs'];
    const files = isForce ? [...tempFiles, ...forceFiles] : tempFiles;
    const cmd = `rm -rf ${files.map((name) => join(cwd, name)).join(' ')}`;
    await shell(cmd, { ctx });
  },
});
