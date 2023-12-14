// #!/usr/bin/env node

import { createCommand } from 'ycmd';

import { copyWatch } from './_copyWatch.js';
import { commonOptions } from './utils/commonOptions.js';
import { defaultOptions as def } from './utils/defaultOptions.js';
// import { writePackageJsonModules } from './utils/writePackageJsonModules.js';

export default createCommand({
  command: 'copy [-w][-s] <from> <to>',
  describe: 'copy with watch',
  builder: (yargs) =>
    yargs.options({
      watch: commonOptions.watch,
      silent: commonOptions.silent,
    }),

  // meta: import.meta,
  async main({ log, argv }) {
    const { silent: isSilent = def.isSilent, watch: isWatch = true } = argv;

    const rawFrom = argv.from;
    const rawTo = argv.to;
    if (!rawFrom) throw new Error('from not found');
    if (!rawTo) throw new Error('to not found');

    await copyWatch(rawFrom, rawTo, { log, isSilent, isWatch });
  },
});
