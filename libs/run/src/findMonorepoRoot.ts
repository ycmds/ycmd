/* eslint-disable no-console */

import { join } from 'node:path';

import type { CwdParams } from '@ycmd/utils';
import { findFileUp } from '@ycmd/utils';

// https://github.com/bubkoo/find-monorepo-root/tree/master
// https://github.com/alienfast/find-monorepo-root
export async function findMonorepoRoot(
  options: CwdParams = { cwd: process.cwd() },
): Promise<string | null> {
  // TODO: add yarn & pnpm & bolt support
  const filenames = ['lerna.json', 'pnpm-workspace.yaml'];
  const { cwd = process.cwd() } = options;

  const filepath = await findFileUp(filenames, { cwd });
  if (!filepath) return null;
  return join(filepath, '..');
}
