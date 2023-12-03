import { readFileSync } from 'node:fs';

import { tryJSONparse } from './tryJSONparse.js';

export const readJsonSync = (jsonPath: string) => tryJSONparse(readFileSync(jsonPath, 'utf8'));
