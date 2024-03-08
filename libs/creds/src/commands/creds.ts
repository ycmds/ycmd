// #!/usr/bin/env node

import { createCommand } from '@ycmd/run';
import { addCwd } from '@ycmd/utils';

import { build } from '../core/build.js';
import { buildDeep } from '../core/buildDeep.js';
import { upload } from '../core/upload.js';
import { uploadDeep } from '../core/uploadDeep.js';

export default createCommand({
  command: 'creds <dir> [--force] [--deep] [--build] [--upload]',
  builder: (yargs: any) =>
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
      if (isUpload) await uploadDeep(dirname, { force, log });
    } else {
      if (isBuild) await build(dirname, { force, log });
      if (isUpload) await upload(dirname, { force, log });
    }
  },
});
