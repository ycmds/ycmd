// #!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { createCommand, pnpmRecursive, readJson, shell } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';

export default createCommand({
  command: 'prepack',
  describe: 'prepare package for publishing',
  builder: (yargs) =>
    yargs.options({
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      dir: {
        ...commonOptions.dist,
        describe: 'Specify the tmp directory for operation',
        default: '.release',
      },
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, argv, log }) {
    // console.log({ isRoot, cwd });
    if (isRoot) {
      // console.log('ycmd prepack --prod --silent');
      // await shellParallel('ycmd prepack --prod --silent', { ctx, argv });
      await pnpmRecursive(`run prepack --prod --silent`, { ctx, argv });
      return;
    }
    const { cleanPublish } = await import('clean-publish');
    // const
    // import { cleanPublish } from 'clean-publish';

    const { dir: tempDir = '.release', silent: isSilent } = argv;

    // TODO: очень опасная операция, надо сделать проверку на то, что приходит в dir
    await shell('rm -rf .release', { ctx, silence: true });

    const dirFiles = await readdir(cwd);
    const packageJson = (await readJson(join(cwd, 'package.json'))) as Record<string, any>;
    let files = [];
    if (packageJson?.files?.length) {
      const packageFiles = packageJson.files;
      packageFiles.push('package.json');
      files = dirFiles.filter((f) => !packageFiles.includes(f));
    }
    // console.log('cleanPublish', { cwd, tempDir });
    await cleanPublish({
      cwd,
      tempDir,
      files,
      cleanDocs: true,
      cleanComments: true,
      withoutPublish: true,
      fields: ['//', '///', '////', 'private'],
    });
    // .catch((err) => {
    //   log.error('cleanPublish error', err);
    //   // @ts-ignore
    //   log.error('[cleanPublish]', err.stack);
    //   throw err;
    // });
    if (!isSilent) log.debug('prepack >', tempDir, { cwd });
    // console.log('cleanPublish done', { cwd });
  },
});
