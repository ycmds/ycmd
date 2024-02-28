export function addCwd(dir: string, { cwd = process.cwd() } = {}) {
  if (typeof dir !== 'string') return dir;
  if (dir[0] === '/') return dir;
  // eslint-disable-next-line no-param-reassign
  if (dir[0] === '~') return process.env.HOME + dir.slice(2);
  return `${cwd}/${dir}`;
}
