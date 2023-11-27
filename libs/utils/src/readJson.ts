import { readFile } from 'fs/promises';

import { tryJSONparse } from './tryJSONparse';

export const readJson = async (jsonPath: string) => tryJSONparse(await readFile(jsonPath, 'utf8'));
