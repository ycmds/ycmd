import { mapValues } from '@lsk4/algos';
import env, { stage, version } from '@lsk4/env';
import { getLskConfig } from '@ycmd/utils';

import type { MainOptions } from './types.js';

// @ts-ignore
export async function printInfo({
  config,
  nodeBin,
  ycmdBin,
  log,
  cwd,
  cwdInfo,
}: MainOptions & { log: any }) {
  const pad = (a: string) => `${a} `.padEnd(14);
  log(pad('[Name]     '), config.name);
  log(pad('[Version]  '), config.version);
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
  const lskrc = getLskConfig();
  log(pad(''));
  log(pad('[lskrc]'), lskrc.path || 'Not found');
  if (process.env.DEBUG) {
    log(lskrc);
    log(pad('[config]'), config);
  }

  // @ts-ignore
  const time = process.ycmdStartedAt ? new Date().getTime() - process.ycmdStartedAt.getTime() : 0;
  if (time) {
    log(pad('time'), time, 'ms');
  }
}

export default printInfo;
