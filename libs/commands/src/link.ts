// #!/usr/bin/env node

import { Err } from '@lsk4/err';
import { map } from 'fishbird';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { createCommand, getShortPath, readJson } from 'ycmd';

import { copyWatch } from './_copyWatch.js';
import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions as def } from './utils/defaultOptions.js';

export default createCommand({
  command: 'link <from> [to...]',
  describe: 'package to package',
  builder: (yargs) =>
    yargs.options({
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ log, argv }) {
    const { silent: isSilent = def.isSilent } = argv;
    const rawFrom = argv.from;
    const rawTos = argv.to;
    const packagePath = resolve(`${rawFrom.replace('~', process.env.HOME || '~')}/package.json`);
    const packageJson = (await readJson(packagePath)) as any;
    if (!packageJson) {
      log.error('package.json not found');
      throw new Err('package.json not found');
    }
    const packageName = packageJson?.name;
    if (!packageName) {
      log.error('package name not found');
      throw new Err('package name not found');
    }
    // console.log({ rawTos });
    if (!rawTos.length) {
      log.error('to not found');
      throw new Err('to not found');
    }
    await map(rawTos, async (rawRawTo) => {
      const rawTo = `${rawRawTo}/node_modules/${packageName}`;
      const packageJson2 = (await readJson(`${rawRawTo}/package.json`)) as any;
      if (!packageJson2) {
        log.error('package.json not found');
        throw new Err('package.json not found');
      }
      if (!isSilent) log.debug('[link]', getShortPath(rawFrom), '~>', getShortPath(rawTo));
      await copyWatch(rawFrom, rawTo, {
        log,
        isSilent,
        isWatch: true,
        async onExec() {
          const packageJson3 = (await readJson(`${rawRawTo}/package.json`)) as any;
          packageJson3['//'] += '/';
          // log.debug('packageJson3', `${rawRawTo}/package.json`);
          writeFile(`${rawRawTo}/package.json`, JSON.stringify(packageJson3, null, 2));
        },
      });
    });
  },
});
