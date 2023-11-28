import { map } from 'fishbird';

import { getPackageName } from './getPackageName.js';
import { getRootPath } from './getRootPath.js';
import { isFileExist } from './isFileExist.js';
import { isWorkspaceRoot } from './isWorkspaceRoot.js';
import { CwdInfo, CwdParams } from './types.js';

export const getCwdInfo = async ({ cwd }: CwdParams): Promise<CwdInfo> => {
  const files = [
    '.swcrc',
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
    exists[filename] = await isFileExist(`${cwd}/${filename}`);
  });
  const existsSync = (filename: string) => !!exists[filename];

  const isSwc = existsSync(`.swcrc`);
  const isBabel = existsSync(`.babelrc.js`) || existsSync(`.babelrc`);
  const isTs = existsSync(`tsconfig.json`);
  const isApp = existsSync(`Dockerfile`) || existsSync(`docker-stack.yml`) || existsSync(`k8s.yml`);
  const isLib = !isApp;
  const isNest = existsSync(`nest-cli.json`);
  const isNext = existsSync(`next.config.mjs`) || existsSync(`next.config.js`);
  const isJs = !isBabel && !isTs && !isSwc;

  return {
    name: getPackageName({ cwd }) || null,
    isRoot: isWorkspaceRoot({ cwd }),
    rootPath: !isWorkspaceRoot({ cwd }) ? getRootPath({ cwd }) : null,
    isJs,
    isSwc,
    isBabel,
    isTs,
    isLib,
    isApp,
    isNest,
    isNext,
  };
};

// export { isRoot, getRootPath, isPackage, getPackageName, getCwdInfo };
