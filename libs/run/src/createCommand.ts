import { Err } from '@lsk4/err';
import { isExecutedFile, log } from '@ycmd/utils';

import type {
  CreateCommandParams,
  CreateCommandResult,
  LskrunProcess,
  MainFunction,
  RootRun,
} from './types.js';
import { wrapMain } from './wrapMain.js';

/**
 * Это функция, обертка, которая позволяет запускать функцию main в разных сценариях.
 *
 * @param main
 * @returns
 */
export const createCommand = (params: CreateCommandParams): CreateCommandResult => {
  let rawMain: MainFunction;
  const proc = process as LskrunProcess;
  const isFirstExec = !proc.lskrun && !proc.lskrunDisableAutorun; // NOTE: ненадежно, нужен другой критерий
  let isAutorun = false;
  if (typeof params === 'function') {
    rawMain = params;
  } else if (typeof params === 'object' && typeof params.main === 'function') {
    rawMain = params.main;
    isAutorun = params.meta ? isExecutedFile(params.meta) : isFirstExec;
  } else {
    throw new Err('!main', "Can't find main function");
  }

  if (isAutorun) {
    if (!isFirstExec) {
      log.warn('[exec]', 'Already executed', proc.lskrun);
    }
    // @ts-ignore
    const rootRun = {
      isAutorun,
      params,
    } as RootRun; // getMainOptions();
    proc.lskrun = rootRun;
  }
  const main = wrapMain(rawMain);
  // const handler = (argv: any) => {
  //   console.log('NOT WTF handler');
  //   return main({ argv });
  // };
  const result = {
    ...params,
    isAutorun,
    isWrapped: true,
    main,
    // handler,
  } as CreateCommandResult;
  // console.log({ params });
  // if (result.command) result.command = 'qwe';
  if (isAutorun) {
    const options = {
      // ...(proc.lskrun ? proc.lskrun : {}),
      isAutorun,
      isFirstExec,
    };
    result.res = main(options);
  }
  return result;
};
