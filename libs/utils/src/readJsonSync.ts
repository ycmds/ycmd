import { readFileSync } from 'node:fs';

import { tryJSONparse } from './tryJSONparse';

export const readJsonSync = (jsonPath: string) => tryJSONparse(readFileSync(jsonPath, 'utf8'));
