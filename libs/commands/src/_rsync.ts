// #!/usr/bin/env node

import { Err } from '@lsk4/err';
import { getShortPath } from 'ycmd';

// @ts-ignore
const undefault = <T>(m: T) => (m.default as T) || m;

const initFlags = {
  a: true,
  E: true,
  z: true,
  v: true,
  progress: false,
  'delete-after': true,
  perms: true,
};

export const rsyncExcludes = ({ excludeNodeModules = true, excludeGit = true }: any = {}) => {
  const excludes = [
    '.DS_Store',
    !excludeNodeModules ? 'node_modules' : null,
    !excludeGit ? '.git' : null,
  ];
  if (excludeNodeModules) excludes.push('node_modules');
  if (excludeGit) excludes.push('.git');
  return excludes;
};

export const rsync = async (from, to, { log, ...options }: any = {}) => {
  const excludes = rsyncExcludes();
  const Rsync = undefault(await import('rsync'));
  const flags = {
    ...initFlags,
    ...options,
  };
  const rs = new Rsync().flags(flags).source(from).destination(to).exclude(excludes);

  if (log) log.trace('[copy]', getShortPath(from), '~>', getShortPath(to));
  if (log) log.trace('[copy]', rs.command());

  rs.output(
    (data) => {
      const str = data.toString().trim();
      if (str.includes('total size is ')) {
        // log.debug(str)
        return;
      }
      if (str.startsWith('building file list')) return;
      if (str.startsWith('done')) return;
      if (log) log.trace('[copy]', '[progress]', data.toString().trim());
      // do things like parse progress
    },
    () => {
      // data
      // do things like parse error output
    },
  );

  return rs.execute((err, code, cmd) => {
    if (err) {
      if (log) log.error({ code, err, cmd });
      throw new Err(err, { code, cmd });
    }
    if (log) log.info('[copy]', getShortPath(from), '~>', getShortPath(to));
  });
};
