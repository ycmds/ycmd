import { importRequire } from './importRequire';

export async function loadConfig(dirname: string) {
  const path = `${dirname}/config.js`;
  const res = await importRequire(path);
  return { path, config: res.default || res };
}
