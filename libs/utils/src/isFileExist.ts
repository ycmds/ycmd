import { access } from 'node:fs/promises';

export const isFileExist = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );
