/* eslint-disable max-len */
// #!/usr/bin/env node

import { createCommand } from '@ycmd/run';

// import { addCwd } from '@ycmd/utils';
import downloadAndSave from '../core/downloadAndSave';

export default createCommand({
  // command: 'spreadsheet <url> [-o file.ts] [-f esm] [--nested] [--type objects] [--mapper js]',
  command: 'spreadsheet <url>',
  // [-o file.ts] [-f esm] [--nested] [--type objects] [--mapper js]
  builder: (yargs: any) =>
    yargs.options({
      out: {
        alias: ['o'],
        describe: 'path to output file',
        type: 'string',
        default: 'STDOUT',
      },
      format: {
        alias: ['f'],
        describe: 'format of the output file <json|cjs|esm|yml|env|csv|guess>',
        type: 'string',
        default: 'guess',
      },

      // '-t, --type <array|objects|object>',
      // 'type of data in spreadsheet.  array = raw array of string, objects = forst row is keys, object = first row is keys, second as values',
      // 'objects',
      type: {
        alias: ['t'],
        describe: 'type of objects <array|objects|object>',
        // array = raw array of string, objects = array, first row as keys, object = first row is keys, second as values
        type: 'string',
        default: 'objects',
      },
      nested: {
        alias: ['n'],
        describe: 'works with nested fields',
        type: 'boolean',
        default: false,
      },
      filter: {
        alias: ['l'],
        describe: 'filter function',
        type: 'string',
        optional: true,
      },
      mapper: {
        alias: ['m'],
        describe: 'mapper function',
        type: 'string',
        optional: true,
      },
      omitNull: {
        describe: 'omit null fields in result',
        type: 'boolean',
        default: false,
      },
    }),
  describe: 'download google spreadsheet and save in file',
  // meta: import.meta,
  async main({ cwd, argv, log }) {
    const {
      url,
      out,
      format: initFormat,
      nested,
      type,
      mapper: rawMapper,
      filter: rawFilter,
      omitNull,
    } = argv;
    const format = initFormat === 'guess' ? null : initFormat;
    // eslint-disable-next-line no-eval
    const mapper = rawMapper ? eval(`(${rawMapper})`) : (a: any) => a;
    // eslint-disable-next-line no-eval
    const filter = rawFilter ? eval(`(${rawMapper})`) : (a: any) => a;
    await downloadAndSave(
      url,
      {
        out,
        format,
        nested,
        type,
        mapper,
        filter,
        omitNull,
      },
      { cwd, log },
    );
  },
});
