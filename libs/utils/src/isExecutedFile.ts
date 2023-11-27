import { fileURLToPath } from 'node:url';

export const isExecutedFile = (meta: ImportMeta) => {
  if (meta?.url.startsWith('file:')) {
    const modulePath = fileURLToPath(meta.url);
    if (process.argv[1] === modulePath) {
      return true;
    }
  }
  return false;
};
