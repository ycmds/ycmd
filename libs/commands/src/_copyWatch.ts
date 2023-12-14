// #!/usr/bin/env node

import { resolve } from 'path';
import { getShortPath } from 'ycmd';

import { rsync, rsyncExcludes } from './_rsync';

// @ts-ignore
const undefault = <T>(m: T) => (m.default as T) || m;
const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

export const copyWatch = async (rawFrom, rawTo, { log, isWatch, isSilent, onExec }: any = {}) => {
  const from = resolve(rawFrom.replace('~', process.env.HOME || '~'));
  const to = resolve(rawTo.replace('~', process.env.HOME || '~'));
  const copy = debounce(async () => {
    await rsync(`${from}/`, `${to}/`, { log: isSilent ? null : log });
    if (onExec) await onExec();
  }, 100);

  await copy();
  if (isWatch) {
    if (log) log.debug('[watch]', getShortPath(from), '~>', getShortPath(to));
    const { watch } = undefault(await import('watchlist'));
    await watch([from], () => copy(), { ignore: rsyncExcludes() });
  }
};
