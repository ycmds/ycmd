import env, { stage, version } from '@lsk4/env';
import { getCwdInfo, getLskConfig } from '@ycmd/utils';

const mapValues = (obj: any, fn: any) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k)]));

// @ts-ignore
export async function printInfo({ config, log } = {}) {
  const pad = (a: string) => `${a} `.padEnd(14);
  log(pad('[Name]     '), config.name);
  log(pad('[Version]  '), config.version);
  // log(pad('System:    '), config.userAgent);
  // log(pad('CLI:       '), config.root);
  // log(pad("Scripts: "), config.version);

  const cwd = process.cwd();

  log(pad(''));
  log(pad('[CWD]      '), cwd);
  mapValues(await getCwdInfo({ cwd }), (value: string, key: string) => {
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
}

export default printInfo;
