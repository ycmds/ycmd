/* eslint-disable max-len */
// #!/usr/bin/env node

import { createCommand } from '@ycmd/run';

// import { addCwd } from '@ycmd/utils';
import downloadAndSave from '../core/downloadAndSave';

export default createCommand({
  command:
    'spreadsheet <url> -o file.ts [--f esm] [--nested] [--type objects] [--mapper (r) => ({ ...r, y: r.x * 2] })',
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
        describe: 'format of the output file <csv|json|cjs|esm|yaml|keyval|dotenv>',
        type: 'string',
        default: 'json',
      },

      // '-t, --type <array|objects|object>',
      // 'type of data in spreadsheet.  array = raw array of string, objects = forst row is keys, object = first row is keys, second as values',
      // 'objects',
      type: {
        alias: ['t'],
        describe:
          'type of data in spreadsheet. array = raw array of string, objects = array, first row as keys, object = first row is keys, second as values',
        type: 'string',
        default: 'objects',
      },
      nested: {
        alias: ['n'],
        describe: 'works with nested fields',
        type: 'boolean',
        default: false,
      },
      mapper: {
        alias: ['m'],
        describe: 'mapper function',
        type: 'string',
      },
      filter: {
        alias: ['l'],
        describe: 'filter function',
        type: 'string',
      },
    }),
  describe: 'fetch the contents of the Google Spreadsheet',
  // meta: import.meta,
  async main({ cwd, argv, log }) {
    const { url, out, format, nested, type, mapper } = argv;
    await downloadAndSave(
      url,
      {
        out,
        format,
        nested,
        type,
        mapper,
      },
      { cwd, log },
    );
  },
});
