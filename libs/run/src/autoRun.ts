import { LskrunProcess } from './types';

export const disableAutorun = async () => {
  const proc = process as LskrunProcess;
  proc.lskrunDisableAutorun = true;
};
export const enableAutorun = async () => {
  const proc = process as LskrunProcess;
  delete proc.lskrunDisableAutorun;
};
