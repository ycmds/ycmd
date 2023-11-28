import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { defaultOptions } from './defaultOptions.js';

export const writePackageJsonModules = ({
  cwd,
  libDir = defaultOptions.libDir,
  cjsDir = defaultOptions.cjsDir,
}: {
  cwd: string;
  libDir?: string;
  cjsDir?: string;
}) =>
  Promise.all(
    [
      libDir
        ? writeFile(join(cwd, libDir, 'package.json'), JSON.stringify({ type: 'module' }, null, 2))
        : null,
      cjsDir
        ? writeFile(
            join(cwd, cjsDir, 'package.json'),
            JSON.stringify({ type: 'commonjs' }, null, 2),
          )
        : null,
    ].filter(Boolean),
  );
