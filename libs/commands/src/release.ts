// #!/usr/bin/env node
import { omitNull, pick } from '@lsk4/algos';
import { createCommand, getCwdInfo, shell } from 'ycmd';

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
      // dir: {
      //   ...commonOptions.dist,
      //   describe: 'Specify the tmp directory for operation',
      //   default: '.release',
      // },
    }),

  // meta: import.meta,
  async main({ ctx, argv: initArgv, isRoot, cwd }) {
    const { yes: isYes, prod: isProd, silent: isSilent } = initArgv;
    const { dry: isDryRun } = initArgv;
    const argv = pick(initArgv, ['prod', 'silent']);

    const isNoBuild = false;
    const isNoTest = false;
    const isNoPublish = false;
    const isNoClean = false;
    if (isRoot) {
      const env = {
        ...process.env,
        ...omitNull({
          YCMD_SILENT: isSilent ? '1' : null,
          YCMD_PROD: isProd ? '1' : null,
        }),
      };
      // TODO: check git changes
      if (!isNoBuild) await shell('ycmd build', { ctx, argv, env }); //  --prod --silent
      if (!isNoTest) await shell('ycmd test', { ctx, argv, env }); //  --prod --silent
      await shell('ycmd prepack', { ctx, argv, env }); //  --prod --silent
      await shell('ycmd version', { ctx, argv: { ...argv, yes: isYes }, env }); //  --prod --silent
      // await shell('ycmd prepack', { ctx, argv, env }); //  --prod --silent
      if (!isNoPublish) await shell('ycmd publish', { ctx, argv: { ...argv, dry: isDryRun }, env }); //  --prod --silent
      if (!isNoClean) await shell('ycmd clean', { ctx, env }); //  --prod --silent
      // const hasAnyLib = true; // Adjust according to your actual condition
      // if (hasAnyLib) {
      //   let cmd = `${findBin('lerna')} version`;
      //   if (isYes) cmd += ' --yes';
      //   await shell(cmd, { ctx, argv });
      //   if (!isCI || argv.includes('--no-push')) {
      //     await shell('git push --follow-tags');
      //   }
      // }
      return;
    }
    const env = {
      ...process.env,
      ...omitNull({
        YCMD_SILENT: isSilent ? '1' : null,
        YCMD_PROD: isProd ? '1' : null,
      }),
    };
    // TODO: NOT CHECK GIT

    const { isLib, isNext } = await getCwdInfo({ cwd });
    if (isLib) {
      if (!isNoBuild) await shell('pnpm run build', { ctx, argv, env }); // NOTE: --prod --silent
      if (!isNoTest) await shell('pnpm run test', { ctx, argv, env }); // NOTE: --prod --silent
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
