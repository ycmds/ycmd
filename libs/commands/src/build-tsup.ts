// #!/usr/bin/env node
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { delay, props } from 'fishbird';
import { createCommand, findBin, getCwdInfo, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions } from './utils/defaultOptions.js';
import { writePackageJsonModules } from './utils/writePackageJsonModules.js';

export default createCommand({
  command: 'build:ts [-w][-p][-s][-e]',
  describe: 'build TS project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      exec: commonOptions.exec,
      dts: commonOptions.dts,
      dist: commonOptions.dist,
      clean: commonOptions.clean,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, log, argv } = {}) {
    if (isRoot) {
      await shellParallel(`ycmd build:ts`, { ctx, argv });
      return;
    }
    const {
      prod: isProd = defaultOptions.isProd,
      silent: isSilent = defaultOptions.isSilent,
      clean: isClean = false,
      watch: isWatch = false,
      dts: isDts = true,
    } = argv;
    const { exec: isExec = isWatch && (await getCwdInfo({ cwd })).isApp } = argv;

    // https://tsup.egoist.dev/#minify-output
    let cmd = '';
    if (isExec) {
      const path = 'src/**';
      const ext = 'ts,tsx,js,jsx,mjs,cjs,json';
      cmd = findBin('ts-node');
      cmd += ' src';
      // cmd += ' src/index.ts';
      log.trace('watching path:', path);
      log.trace('watching extensions:', ext);
      log.debug('to restart at any time, enter `rs`');
      // 'nodemon --watch "src/**" --ext "ts,json" --ignore "src/**/*.spec.ts" --exec "ts-node src/index.ts"';
      cmd = `nodemon --watch "${path}" --ext "${ext}" --exec "${cmd}" --quiet`;
    } else {
      cmd = findBin('tsup');
      cmd += ' src';
      // if (isSilent) cmd += ' --silent';
      if (isWatch) cmd += ' --watch';
      if (!isDts) cmd += ' --no-dts';
    }
    const env = { ...process.env };
    if (isProd) env.NODE_ENV = 'production';
    if (isClean) {
      await props(
        {
          cjsDir: defaultOptions.cjsDir,
          libDir: defaultOptions.libDir,
        },
        async (dir) => {
          const cleanDir = join(cwd, dir);
          log.debug('[rm]', cleanDir);
          await rm(cleanDir, { recursive: true, force: true });
        },
      );
      await writePackageJsonModules({ cwd });
    }
    await Promise.all([
      delay(100).then(() => writePackageJsonModules({ cwd })),
      shell(cmd, { ctx, env, silence: isSilent ? 'all' : false }).catch(async (err) => {
        if (!isSilent) throw err;
        log.error('Error while running', cmd);
        await shell(cmd, { ctx, env });
      }),
    ]);
  },
});
