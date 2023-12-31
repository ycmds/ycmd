/* eslint-disable no-useless-catch */
import { loadMainOptions } from '@ycmd/helpers';

import { LskrunProcess, MainFunction, WrappedMainFunction } from './types.js';

/**
 * Это функция, обертка, которая позволяет запускать функцию main в разных сценариях.
 *
 * @param main
 * @returns
 */
export const wrapMain = (main: MainFunction): WrappedMainFunction => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const proc = process as LskrunProcess;
  return async (anyOptions: any = {}) => {
    const defaultMainOptions = await loadMainOptions();
    const options = {
      ...defaultMainOptions,
      ...anyOptions,
    };
    // console.log({ options });
    try {
      const res = await main(options);
      return res;
    } catch (err) {
      // // @ts-ignore
      // const l = options.log || log;
      // l.error('[wrapMain]', err);
      // // @ts-ignore
      // l.error('[stack]', err.stack);
      // if (isAutorun) {
      // proc.exit(1);
      // }
      throw err;
    }
  };
};
