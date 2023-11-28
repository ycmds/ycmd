// #!/usr/bin/env node
import { VersionCommand } from '@lerna/version';
import { createCommand, shell } from 'ycmd';

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
  async main({ ctx, argv, isRoot, log } = {}) {
    const { yes: isYes } = argv;

    if (isRoot) {
      let cmd = `lerna version --loglevel error`;
      if (isYes) cmd += ' --yes';
      console.log({ cmd });
      const command = new VersionCommand(cmd.split(' '));
      // console.log({ command });
      return;
    }
    await shell('npm version prerelease --preid alpha'); // TODO: пожумать
  },
});
