export const tryJSONparse = <T, K = undefined>(str: string, def?: K): T | K | undefined => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return def;
  }
};
