// #!/usr/bin/env node

import { Err } from '@lsk4/err';
import { createCommand } from '@ycmd/run';
import { addCwd } from '@ycmd/utils';

import { build } from '../core/build';
import { buildDeep } from '../core/buildDeep';
import { upload } from '../core/upload';

export default createCommand({
  command: 'creds <dir> [--force] [--deep] [--build] [--upload]',
  builder: (yargs) =>
    yargs.options({
      build: {
        alias: ['b'],
        describe: 'build creds',
        type: 'boolean',
        default: true,
      },
      upload: {
        alias: ['u'],
        describe: 'upload creds',
        type: 'boolean',
        default: false,
      },
      deep: {
        alias: ['d'],
        describe: 'find in subdirs',
        type: 'boolean',
        default: false,
      },
      force: {
        alias: ['f'],
        describe: 'force to run',
        type: 'boolean',
        default: false,
      },
    }),
  describe: 'build and/or upload creds',
  // meta: import.meta,
  async main({ cwd, argv, log }) {
    const rawDir = argv.dir || '.';
    const dirname = addCwd(rawDir, { cwd });
    const { build: isBuild, upload: isUpload, deep: isDeep, force } = argv;
    if (isDeep) {
      if (isBuild) await buildDeep(dirname, { force, log });
      if (isUpload) throw new Err('Not implemented mass upload');
    } else {
      if (isBuild) await build(dirname, { force, log });
      if (isUpload) await upload(dirname, { force, log });
    }
  },
});
