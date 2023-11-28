// #!/usr/bin/env node
import { VersionCommand } from '@lerna/version';
import { createCommand, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

// const { Version } = pkg;
// console.log({ VersionCommand });
// console.log({ pkg });
// console.log(pkg.VersionCommand);

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
      // const meta = import.meta;

      let cmd = `lerna version`;
      if (isYes) cmd += ' --yes';
      // await shell(cmd, { ctx });
      const command = new VersionCommand(cmd.split(' '));
      command.logger = log;
      // console.log({ command });
      // if (!isCI || argv.includes('--no-push')) {
      //   await shell('git push --follow-tags');
      // }
      return;
    }
    await shell('npm version prerelease --preid alpha'); // TODO: пожумать
  },
});
