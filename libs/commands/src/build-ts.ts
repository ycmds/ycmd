// #!/usr/bin/env node
import { join } from 'node:path';

import { createCommand, getCwdInfo, rmDirs, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions as def } from './utils/defaultOptions.js';
import { writePackageJsonModules } from './utils/writePackageJsonModules.js';

export default createCommand({
  command: 'build:tsup [-w][-p][-s][-e]',
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
      prod: isProd = def.isProd,
      silent: isSilent = def.isSilent,
      clean: isClean = false,
      watch: isWatch = false,
      dts: isDts = true,
    } = argv;
    const { exec: isExec = isWatch && (await getCwdInfo({ cwd })).isApp } = argv;

    const { build: buildTsup } = await import('@macrobe/tsup');

    if (isExec) {
      const nodemon = await import('nodemon');
      const path = 'src/**';
      const ext = 'ts,tsx,js,jsx,mjs,cjs,json';
      await nodemon({
        path,
        ext,
      });
      return;

      //   cmd = findBin('ts-node');
      //   cmd += ' src';
      //   // cmd += ' src/index.ts';
      //   log.trace('watching path:', path);
      //   log.trace('watching extensions:', ext);
      //   log.debug('to restart at any time, enter `rs`');
      //   // 'nodemon --watch "src/**" --ext "ts,json" --ignore "src/**/*.spec.ts" --exec "ts-node src/index.ts"';
      //   cmd = `nodemon --watch "${path}" --ext "${ext}" --exec "${cmd}" --quiet`;
      // } else {
      //   cmd = findBin('tsup');
      //   cmd += ' src';
      // if (isSilent) cmd += ' --silent';
      // if (isWatch) cmd += ' --watch';
      // if (!isDts) cmd += ' --no-dts';
    }
    const env = { ...process.env };
    if (isProd) env.NODE_ENV = 'production';
    if (isClean) {
      const dirs = [def.cjsDir, def.libDir]
        .map((dir) => {
          // For security reasons, we only allow paths that start with a dot or a slash.
          if (!dir) return null;
          if (dir.startsWith('/')) return null;
          if (dir.startsWith('..')) return null;
          return join(cwd, dir);
        })
        .filter(Boolean);
      log.debug('[rm]', dirs);
      await rmDirs(dirs);
    }

    // https://tsup.egoist.dev/#minify-output

    const options: any = {
      name: 'ycmd',
      watch: isWatch,
      clean: isClean,
      minify: isProd,
      silent: isSilent,
      // config: join(cwd, 'presets/tsup2.config.ts'),
      entry: ['src'],
      // entryPoints: ['src/index.ts'],
      // outdir: 'lib',
      // minify: true,
      // legacyOutput: true,
      // splitting: true,
      // splitting: true,
      // format: ['cjs', 'esm'],
      // dts: true,
      // sourcemap: true,
      // entryPoints: ['src/index.ts'],
      // outdir: 'lib',
      // minify: true,
      // legacyOutput: true,
      // splitting: true,
    };
    if (!isDts) options.dts = false;
    await buildTsup(options);
    await writePackageJsonModules({ cwd });
  },
});
