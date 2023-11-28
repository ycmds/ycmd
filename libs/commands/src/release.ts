// #!/usr/bin/env node
import { omitNull } from '@lsk4/algos';
import { createCommand, getCwdInfo, isCI, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'release [-y][-p][-s][-d]',
  describe: 'run release process',
  builder: (yargs) =>
    yargs.options({
      yes: commonOptions.yes,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      dry: commonOptions.dry,
      dir: {
        ...commonOptions.dist,
        describe: 'Specify the tmp directory for operation',
        default: '.release',
      },
    }),

  // meta: import.meta,
  async main({ ctx, argv, isRoot, cwd } = {}) {
    const { yes: isYes, prod: isProd, silent: isSilent } = argv;
    const { dry: isDryRun } = argv;

    if (isRoot) {
      //   const env = {
      //     YCMD_SILENT: '1',
      //     YCMD_PROD: '1',
      //   };
      await shell('ycmd build --prod --silent', { ctx, argv }); // NOTE: env
      await shell('ycmd test --prod --silent', { ctx, argv }); // NOTE: env
      await shell('ycmd prepack', { ctx, argv });
      const hasAnyLib = true; // Adjust according to your actual condition
      if (hasAnyLib) {
        let cmd = 'lerna publish --no-push --contents .release';
        if (isYes) cmd += ' --yes';
        await shell(cmd, { ctx, argv });
        if (!isCI || argv.includes('--no-push')) {
          await shell('git push --follow-tags');
        }
      }
      return;
    }
    const env = {
      ...process.env,
      ...omitNull({
        YCMD_SILENT: isSilent ? '1' : null,
        YCMD_PROD: isProd ? '1' : null,
      }),
    };
    const { isLib, isNext } = await getCwdInfo({ cwd });
    if (isLib) {
      await shell('pnpm run build', { ctx, argv, env }); // NOTE: --prod --silent
      await shell('pnpm run test', { ctx, argv, env }); // NOTE: --prod --silent
      await shell('npm version prerelease --preid alpha');
      await shell('ycmd prepack', { ctx, argv });
      await shell('ycmd publish', { ctx, argv });
    } else if (isNext) {
      await shell('pnpm -F "." deploy .release', { ctx, argv });
      const newCwd = `${cwd}/.release`;
      await shell('npm run build', { ctx, argv, cwd: newCwd, env });
    } else {
      await shell('pnpm run build', { ctx, argv, env });
      await shell('pnpm -F "." deploy .release', { ctx, argv });
    }
  },
});
