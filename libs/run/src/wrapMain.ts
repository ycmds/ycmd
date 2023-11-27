import { log } from '@ycmd/utils';

import { LskrunProcess, MainFunction, MainOptions, WrappedMainFunction } from './types.js';

/**
 * Это функция, обертка, которая позволяет запускать функцию main в разных сценариях.
 *
 * @param main
 * @returns
 */
export const wrapMain = (main: MainFunction): WrappedMainFunction => {
  const proc = process as LskrunProcess;
  return async (mainOptions: MainOptions = {}) => {
    const options = {
      argv: {},
      ...mainOptions,
    };
    // console.log({ options });
    try {
      const res = await main(options);
      return res;
    } catch (err) {
      log.error('[wrapMain]', err);
      // if (isAutorun) {
      proc.exit(1);
      // }
      throw err;
    }
  };
};
