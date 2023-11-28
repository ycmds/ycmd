// #!/usr/bin/env node
import { createCommand, findBin, isCI, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'version [-y][-d]',
  describe: 'create new semver version',
  builder: (yargs) =>
    yargs.options({
      yes: commonOptions.yes,
      dry: commonOptions.dry,
      dir: {
        ...commonOptions.dist,
        describe: 'Specify the tmp directory for operation',
        default: '.release',
      },
    }),

  // meta: import.meta,
  async main({ ctx, argv, isRoot } = {}) {
    const { yes: isYes } = argv;
    if (isRoot) {
      let cmd = `${findBin('lerna')} version`;
      if (isYes) cmd += ' --yes';
      await shell(cmd, { ctx, argv });
      // if (!isCI || argv.includes('--no-push')) {
      //   await shell('git push --follow-tags');
      // }
      return;
    }
    await shell('npm version prerelease --preid alpha'); // TODO: пожумать
  },
});
