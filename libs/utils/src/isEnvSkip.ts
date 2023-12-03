import { isYes } from './isYes.js';

export const isEnvSkip = (names: string | string[]) => {
  if (typeof process === 'undefined') return false;
  // eslint-disable-next-line no-param-reassign
  if (!Array.isArray(names)) names = [names];
  const envs = process.env || {};
  return names.some(
    (name) => isYes(envs[`SKIP_${name.toUpperCase()}`]) || isYes(envs[`NO_${name.toUpperCase()}`]),
  );
};
