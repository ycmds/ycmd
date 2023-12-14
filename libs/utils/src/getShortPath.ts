export const getShortPath = (link = '', { cwd = process.cwd() } = {}) => {
  if (link.endsWith(`${cwd}/`)) {
    // eslint-disable-next-line no-param-reassign
    link = link.replace(`${cwd}/`, '.');
  }
  return link
    .replace(`${cwd}/`, '')
    .replace(cwd, '.')
    .replace(process.env.HOME || '', '~');
};
