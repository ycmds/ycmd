import { Err } from '@lsk4/err';
import { isExecutedFile, log } from '@ycmd/utils';

import { getMainOptions } from './getMainOptions.js';
import { CreateCommandParams, CreateCommandResult, LskrunProcess, MainFunction } from './types.js';
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
  const isFirstExec = !proc.lskrun && !proc.lskrunScan; // NOTE: ненадежно, нужен другой критерий
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
    proc.lskrun = getMainOptions();
  }
  const main = wrapMain(rawMain);
  const result = {
    ...params,
    isAutorun,
    main,
  } as CreateCommandResult;
  // console.log({ params });
  // if (result.command) result.command = 'qwe';
  if (isAutorun) {
    const options = {
      ...(proc.lskrun ? proc.lskrun : {}),
      isAutorun,
      isFirstExec,
    };
    result.res = main(options);
  }
  return result;
};
