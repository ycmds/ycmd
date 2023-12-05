// #!/usr/bin/env node
import { delay } from 'fishbird';
import { createCommand, findBin, getCwdInfo, shell, shellParallel } from 'ycmd';

import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions } from './utils/defaultOptions.js';
import { writePackageJsonModules } from './utils/writePackageJsonModules.js';

export default createCommand({
  command: 'build:swc [-w]',
  describe: 'build SWC project',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      prod: commonOptions.prod,
      silent: commonOptions.silent,
      dist: commonOptions.dist,
    }),

  // meta: import.meta,
  async main({ isRoot, ctx, cwd, argv }) {
    if (isRoot) {
      await shellParallel(`ycmd build:swc`, { ctx, argv });
      return;
    }
    const {
      prod: isProd = defaultOptions.isProd,
      silent: isSilent = defaultOptions.isSilent,
      watch: isWatch = false,
      dist: libDir = defaultOptions.libDir,
      cjsDist: cjsDir = defaultOptions.cjsDir,
    } = argv;
    const { exec: isExec = isWatch && (await getCwdInfo({ cwd })).isApp } = argv;

    // const { watch: isWatch = false, dist: libDir = 'lib' } = argv;

    if (!isWatch) await shell(`rm -rf ${libDir}`, { ctx, silence: true });
    await shell(`mkdir -p ${libDir}`, { ctx, silence: true });

    // const { isApp } = await getCwdInfo({ cwd });
    let cmd;

    cmd += findBin('swc');
    cmd += ' src';

    if (isProd) {
      cmd += ` --minify`;
      // cmd += ` --minify`;
      // -C module.type=amd -C module.moduleId=hello
      // cmd += ` -w`;
    }
    if (isSilent) {
      cmd += ` --quite`;
    }
    if (isWatch) {
      cmd += ` --watch`;
    }
    const cjsCmd = `${cmd} -d ${cjsDir} -C module.type=commonjs`;
    const esmCmd = `${cmd} -d ${libDir} -C module.type=es6`;

    await Promise.all(
      [
        delay(50).then(() => writePackageJsonModules({ cwd })),
        defaultOptions.isCjs ? shell(cjsCmd, { ctx }) : null,
        shell(esmCmd, { ctx }),
      ].filter(Boolean),
    );
  },
});
