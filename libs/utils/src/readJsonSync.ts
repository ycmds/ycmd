import fs from 'node:fs';

import { tryJSONparse } from './tryJSONparse';

export const readJsonSync = (jsonPath: string) => tryJSONparse(fs.readFileSync(jsonPath, 'utf8'));
