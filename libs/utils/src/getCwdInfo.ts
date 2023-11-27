import { access } from 'node:fs/promises';

import { map } from 'fishbird';

import { getPackageName } from './getPackageName.js';
import { getRootPath } from './getRootPath.js';
import { isWorkspaceRoot } from './isWorkspaceRoot.js';
import { CwdInfo, CwdParams } from './types.js';

const exist = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  );

export const getCwdInfo = async ({ cwd }: CwdParams): Promise<CwdInfo> => {
  const files = [
    '.babelrc.js',
    '.babelrc',
    'tsconfig.json',
    'Dockerfile',
    'docker-stack.yml',
    'k8s.yml',
    'nest-cli.json',
    'next.config.mjs',
    'next.config.js',
  ];
  const exists: Record<string, boolean> = {};
  await map(files, async (filename) => {
    exists[filename] = await exist(`${cwd}/${filename}`);
  });
  const existsSync = (filename: string) => !!exists[filename];

  const isBabel = existsSync(`.babelrc.js`) || existsSync(`.babelrc`);
  const isTs = existsSync(`tsconfig.json`);
  const isApp = existsSync(`Dockerfile`) || existsSync(`docker-stack.yml`) || existsSync(`k8s.yml`);
  const isLib = !isApp;
  const isNest = existsSync(`nest-cli.json`);
  const isNext = existsSync(`next.config.mjs`) || existsSync(`next.config.js`);

  return {
    name: getPackageName({ cwd }) || null,
    isRoot: isWorkspaceRoot({ cwd }),
    rootPath: !isWorkspaceRoot({ cwd }) ? getRootPath({ cwd }) : null,
    isJs: !isBabel && !isTs,
    isBabel,
    isTs,
    isLib,
    isApp,
    isNest,
    isNext,
  };
};

// export { isRoot, getRootPath, isPackage, getPackageName, getCwdInfo };
