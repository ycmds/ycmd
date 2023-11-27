export const isYes = (str: string | number | boolean | undefined | null) => {
  if (typeof str === 'boolean') return str;
  if (typeof str === 'number') return str > 0;
  if (typeof str === 'string') {
    const str2 = str.toLowerCase();
    if (str2 === 'yes' || str2 === 'y') return true;
  }
  return false;
};
