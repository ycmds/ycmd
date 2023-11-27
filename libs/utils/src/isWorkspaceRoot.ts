import { existsSync } from 'node:fs';

import { CwdParams } from './types.js';

export const isWorkspaceRoot = ({ cwd }: CwdParams): boolean =>
  existsSync(`${cwd}/lerna.json`) || existsSync(`${cwd}/pnpm-workspace.yaml`);
