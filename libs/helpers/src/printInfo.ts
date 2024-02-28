import { mapValues } from '@lsk4/algos';
import env, { isDev, stage, version } from '@lsk4/env';

import type { MainOptions } from './types.js';

// @ts-ignore
export async function printInfo({
  cmdName,
  cmdVersion,
  config,
  configPath,
  nodeBin,
  ycmdBin,
  log,
  cwd,
  cwdInfo,
}: MainOptions & { log: any }) {
  const pad = (a: string) => `${a} `.padEnd(14);
  log(pad('[Name]     '), cmdName);
  log(pad('[Version]  '), cmdVersion);
  log(pad('[nodeBin]  '), nodeBin);
  log(pad('[ycmdBin]  '), ycmdBin);
  // log(pad('System:    '), config.userAgent);
  // log(pad('CLI:       '), config.root);
  // log(pad("Scripts: "), config.version);

  // const cwd = process.cwd();

  // console.log('getCwdInfo start');
  // console.time('getCwdInfo');
  // const info = await getCwdInfo({ cwd });
  // console.timeEnd('getCwdInfo');
  // console.log('getCwdInfo finish');

  log(pad(''));
  log(pad('[CWD]      '), cwd);

  // @ts-ignore
  mapValues(cwdInfo, (value: string, key: string) => {
    log(pad(`${key}`), value);
  });

  log(pad(''));
  log(pad('[ENV]      '));
  const envKeys = Object.keys(env)
    .sort()
    .filter((key) => key !== 'stage' && key !== 'version');
  log(pad(`stage`), stage);
  log(pad(`version`), version);

  envKeys.forEach((key: string) => {
    const value = (env as any)[key];
    log(pad(`${key}`), value);
  });

  // eslint-disable-next-line no-console
  // const lskrc = getLskConfig();
  log(pad(''));
  log(pad('[CONFIG]'), configPath || 'Not found, using default');
  // if (process.env.DEBUG) {
  // log(JSON.stringify(config, null, 2));
  // log(pad('[config]'), config);
  // }
  // @ts-ignore
  mapValues(config, (value: any, key: string) => {
    if (Array.isArray(value)) {
      value.forEach((v: any, i: number) => {
        log(pad(!i ? key : ''), v);
      });
    } else {
      log(pad(key), value);
    }
  });

  if (isDev) {
    log(pad(''));
    log(pad('[DEBUG]'));
    // @ts-ignore
    const time = process.ycmdStartedAt ? new Date().getTime() - process.ycmdStartedAt.getTime() : 0;
    if (time) {
      log(pad('time'), time, 'ms');
    }
  }
}

export default printInfo;
