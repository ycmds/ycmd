// import { map } from '@lsk4/async';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Err } from '@lsk4/err';
import { getShortPath, loadConfig, loadDefaultConfig, log, resolvePaths } from '@ycmd/utils';
import { map } from 'fishbird';
import { CommandModule } from 'yargs';

import { disableAutorun, enableAutorun } from './autoRun.js';
import { shell } from './shell.js';

// const { map } = Bluebird;

// const items = [1, 2, 3, 4];
// const res = await map(items, async (item) => item);
// const res2 = await Bluebird.map(items, async (item) => item);

type FindCommandOptions = {
  cwd?: string;
  exts?: string[];
  nodemodules?: boolean;
  local?: boolean;
  config?: boolean;
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
const isCommand = (c: any) => c?.command || c?.handler || c?.main;

// console.log(res, res2);
export const findCommands = async (
  initPathOptions: FindCommandOptions,
): Promise<CommandModule[]> => {
  const { exts } = initPathOptions; // , ...pathOptions

  const cwd = initPathOptions.cwd || process.cwd();
  const loadedConfig = await loadConfig({ cwd, default: true });

  const scripts = loadedConfig?.config?.scripts;
  const configPath = loadedConfig?.path;
  const configDirPath = !configPath ? cwd : resolve(configPath, '..');

  // eslint-disable-next-line prefer-const
  let dirs: string[] = [];

  // console.log({ configPath, config, dirs });
  // console.log({ dirs });

  if (scripts) {
    dirs = await resolvePaths(scripts, { cwd: configDirPath });
  } else {
    log.warn('!config.scripts, use getPaths()');
    dirs = (await loadDefaultConfig({ cwd })).scripts;
    // dirs = await getPaths();
  }
  log.trace('[configPath]', configPath);
  log.trace('[configDirPath]', configDirPath);
  log.trace('[loadedConfig]', loadedConfig);
  log.trace('[scripts]', scripts);
  log.trace('[dirs]', dirs);
  log.trace(
    '[short scripts]',
    dirs.map((d) => getShortPath(d)),
  );

  // console.time('rawCommands');
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
  // console.timeEnd('rawCommands');

  // log.trace('[rawCommands]', rawCommands);
  const commandMaps: CommandMap = {};
  rawCommands.forEach((c: any) => {
    if (commandMaps[c.name]) {
      return;
    }
    commandMaps[c.name] = c;
  });

  // console.time('rawContent');
  disableAutorun();
  await map(Object.values(commandMaps), async (c) => {
    // console.time(`readFile ${c.path}`);
    const rawContent = await readFile(c.path);
    // console.timeEnd(`readFile ${c.path}`);

    const isExecutable = String(rawContent).startsWith('#!/');
    const has = (str: string) => String(rawContent).includes(str);
    const isSafeImport =
      (has('export default') && has('createCommand')) ||
      has('export default {') ||
      has('@YCMD-command');
    commandMaps[c.name].isExecutable = isExecutable;
    commandMaps[c.name].isSafeImport = isSafeImport;
    // commandMaps[c.name].isImported = isSafeImport;

    if (isSafeImport) {
      try {
        // console.time(`import ${c.path}`);
        const content = await import(c.path);
        // console.timeEnd(`import ${c.path}`);
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
  enableAutorun();
  // console.timeEnd('rawContent');

  // log.trace('[commandMaps]', commandMaps);
  const dynamicCommands = Object.values(commandMaps)
    // .filter((c) => c.content)
    .map(({ name, fileContent, isExecutable, importErr }) => {
      let command = fileContent?.command || '';

      let describe = fileContent?.describe || '';
      if (!describe) {
        if (importErr) {
          describe += `!!! Error: ${Err.getCode(importErr)}`;
          log.warn('importErr', importErr);
        } else {
          describe += `??? Missed createCommand describe`;
        }
      }

      if (!command) command = name;

      if (isCommand(fileContent)) {
        const { main, isWrapped } = fileContent;
        let { handler } = fileContent;
        if (!handler && main) {
          handler = (argv: any) => {
            if (!isWrapped) {
              log.warn('NOT WTF isWrapped', argv, name, fileContent, isExecutable, importErr);
              throw new Err('!isWrapped', 'isWrapped');
            }
            return main({ argv });
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
          handler: async () => shell(`ycmd ${name} ${process.argv.slice(3).join(' ')}`),
        };
      }
      return null;
    });
  log.trace(
    '[commands]',
    dynamicCommands.map((c) => String(c?.command).split(' ')[0]),
  );

  return dynamicCommands.filter(Boolean);
};
