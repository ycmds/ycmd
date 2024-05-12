import { getFileFormat as getLskFileFormat } from '@lsk4/stringify';

import type { FileFormat } from '../types';

export function getFileFormat(format: string): FileFormat | null {
  if (format === 'jsonEachRow') {
    return 'jsonEachRow';
  }
  return getLskFileFormat(format);
}
