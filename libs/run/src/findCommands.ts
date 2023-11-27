// import { map } from '@lsk4/async';
import { readdir, readFile } from 'node:fs/promises';

import { Err } from '@lsk4/err';
import { getPaths, log } from '@ycmd/utils';
import { map } from 'fishbird';
import { CommandModule } from 'yargs';

import { getMainOptions } from './getMainOptions.js';
import { shell } from './shell.js';
import { LskrunProcess } from './types.js';

// const { map } = Bluebird;

// const items = [1, 2, 3, 4];
// const res = await map(items, async (item) => item);
// const res2 = await Bluebird.map(items, async (item) => item);

type FindCommandOptions = {
  exts?: string[];
  nodemodules?: boolean;
  local?: boolean;
};

interface CommandInfo {
  path: string;
  name: string;
  fileContent?: any;
  isExecutable: boolean;
  isSafeImport: boolean;
  isImported: boolean;
  importErr?: any;
}
type CommandMap = Record<string, CommandInfo>;
// console.log(res, res2);
export const findCommands = async (
  initPathOptions: FindCommandOptions,
): Promise<CommandModule[]> => {
  const { exts, ...pathOptions } = initPathOptions;

  const dirs = await getPaths();
  // const dirs = {
  //   ...(await getPaths({ scriptsDir: 'scripts' })),
  //   ...(await getPaths({ scriptsDir: 'scripts/run' })),
  // };
  log.trace('[dirs]', dirs);

  const rawCommands = await map(dirs, async (dir: string) => {
    try {
      const rawFiles = await readdir(dir);
      return rawFiles
        .filter((file) => (exts || []).some((ext: string) => file.endsWith(ext)))
        .map((file) => ({
          name: file.replace(/\.[^/.]+$/, ''), // TODO:: подумать
          path: `${dir}/${file}`,
        }));
    } catch (err) {
      // console.log('[err]', err)
      return [];
    }
  }).then((c) => c.flat());

  log.trace('[rawCommands]', rawCommands);
  const commandMaps: CommandMap = {};
  rawCommands.forEach((c: any) => {
    if (commandMaps[c.name]) {
      return;
    }
    commandMaps[c.name] = c;
  });

  const proc = process as LskrunProcess;
  proc.lskrunScan = true;
  await map(Object.values(commandMaps), async (c) => {
    const rawContent = await readFile(c.path);

    const isExecutable = String(rawContent).startsWith('#!/');
    const isSafeImport =
      (rawContent.includes('export default') && rawContent.includes('createCommand')) ||
      rawContent.includes('export default {');

    commandMaps[c.name].isExecutable = isExecutable;
    commandMaps[c.name].isSafeImport = isSafeImport;
    // commandMaps[c.name].isImported = isSafeImport;

    if (isSafeImport) {
      try {
        const content = await import(c.path);
        // console.log('[content]', content, rawCommands, c.name);
        commandMaps[c.name].fileContent = await (content.default || content);
        commandMaps[c.name].isImported = true;
      } catch (err) {
        commandMaps[c.name].importErr = err;
        // console.log('[err]', err);
      }
    }

    // if (rawContent.includes('export const')) {
    //   const content = await import(c.path);
    //   rawCommands[c.name].content = content;
    //   return;
    // }

    // const content: any = await import(c.path);
    // rawCommands[c.name].content = content;
  });
  proc.lskrunScan = false;
  const isCommand = (c: any) => c?.command || c?.handler || c?.main;

  log.trace('[commandMaps]', commandMaps);

  const dynamicCommands = Object.values(commandMaps)
    // .filter((c) => c.content)
    .map(({ name, fileContent, isExecutable, importErr }) => {
      let command = fileContent?.command || '';

      let describe = fileContent?.describe || '';
      if (!describe) {
        if (importErr) {
          describe += `!!! Error: ${Err.getCode(importErr)}`;
        } else {
          describe += `??? Missed createCommand describe`;
        }
      }

      if (!command) command = name;

      if (isCommand(fileContent)) {
        const { main } = fileContent;
        let { handler } = fileContent;
        if (!handler && main) {
          handler = (argv: any) => {
            const isFirstExec = !proc.lskrun; // NOTE: ненадежно, нужен другой критерий
            if (!isFirstExec) {
              log.warn('[exec]', 'Already executed', proc.lskrun);
            }
            proc.lskrun = getMainOptions();
            const options = {
              ...(proc.lskrun ? proc.lskrun : {}),
              argv,
              isYargsRun: true,
              // isFirstExec,
            };
            return main(options);
          };
        }
        return {
          ...fileContent,
          command,
          describe,
          // main,
          handler,
        };
      }
      if (isExecutable) {
        return {
          command,
          describe,
          // TODO: pass args
          handler: async () => shell(`lsk4 ${name}`),
        };
      }
      return null;
    });
  log.trace('[dynamicCommands]', dynamicCommands);

  return dynamicCommands.filter(Boolean);
};
