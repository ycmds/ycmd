import { map } from 'fishbird';

import { findMonorepoRoot } from './findMonorepoRoot.js';
import { getPackageName } from './getPackageName.js';
import { isFileExist } from './isFileExist.js';
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
    'k8s.yaml',
    'nest-cli.json',
    'next.config.mjs',
    'next.config.js',
  ];
  const exists: Record<string, boolean> = {};
  await map(files, async (filename) => {
    exists[filename] = await isFileExist(`${cwd}/${filename}`);
  });
  const existsSync = (filename: string) => !!exists[filename];

  const monorepoRoot = await findMonorepoRoot({ cwd });
  const isMonorepo = Boolean(monorepoRoot);
  const isMonorepoRoot = isMonorepo && monorepoRoot === cwd;

  const isSwc = existsSync(`.swcrc`);
  const isBabel = existsSync(`.babelrc.js`) || existsSync(`.babelrc`);
  const isTs = existsSync(`tsconfig.json`);
  const isApp =
    existsSync(`Dockerfile`) ||
    existsSync(`docker-stack.yml`) ||
    existsSync(`k8s.yml`) ||
    existsSync(`k8s.yaml`);
  const isLib = !isApp;
  const isNest = existsSync(`nest-cli.json`);
  const isNext = existsSync(`next.config.mjs`) || existsSync(`next.config.js`);
  const isJs = !isBabel && !isTs && !isSwc;

  return {
    name: getPackageName({ cwd }) || null,
    isMonorepo,
    isRoot: isMonorepoRoot,
    rootPath: monorepoRoot,
    isJs,
    isSwc,
    isBabel,
    isTs,
    isLib,
    isApp,
    isNest,
    isNext,
  } as CwdInfo;
};

// export { isRoot, getRootPath, isPackage, getPackageName, getCwdInfo };
