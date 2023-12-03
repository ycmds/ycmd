import { map } from 'fishbird';
import { rm } from 'fs/promises';

export const rmDirs = async (dirs: string | string[]) => {
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(dirs)) dirs = [dirs];
  await map(dirs, (dir) => rm(dir, { recursive: true }));
};
