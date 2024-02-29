import { Err } from '@lsk4/err';
import { log } from '@ycmd/utils';

export function onFail(msg: string, err: any) {
  const errMessage = msg || Err.getMessage(err);
  const isYargsError = !!msg; // && err.name === 'YError';
  if (errMessage) {
    log.fatal('');
    const showDisclaimer = !isYargsError && Err.getCode(err) !== 'YCMD_MISSING_SCRIPT';
    if (showDisclaimer) {
      // console.log({ msg, err });
      // log.fatal('↑↑↑↑↑↑↑↑↑↑↑  Error Message  ↑↑↑↑↑↑↑↑↑↑↑');
      // log.fatal('');
    }
    let errCode = Err.getCode(err);
    if (errCode === 'err_unknown') errCode = '';
    if (errCode === errMessage) errCode = '';
    const exitCode = err?.proc?.exitCode;
    if (errCode) log.fatal('[Code]    ', errCode);
    if (errMessage && exitCode !== errMessage) {
      log.fatal('[Message]    ', errMessage);
    }
    if (err?.data) {
      Object.entries(err.data).forEach(([key, value]) => {
        log.fatal(`${key}:`, value);
      });
    }
    if (err?.cwd) log.fatal('Cwd:', err.cwd);
    if (err?.proc?.spawnargs) {
      log.fatal('[Command]', err.proc.spawnargs.join(' '));
    } else if (err?.command) {
      if (exitCode) log.fatal('[ExitCode]', exitCode);
      log.fatal('[Command]', err.command);
    }
    if (err?.proc?.pid) log.fatal('[PID]', err?.proc?.pid);
    const stack = err?.stack || err?.options?.ctx?.stack;
    if (stack) {
      log.fatal('');
      log.fatal('[Stack]');
      (stack || []).reverse().forEach((s: any) => {
        log.fatal('  ', s?.command);
        if (s?.filename) log.fatal('   ❯', s?.filename);
        // log.fatal('  ', s?.options?.cwd);
      });
    }
    log.fatal('');
  }
  if (err) {
    // log.error('');
    log.warn('For more info add DEBUG=* before command');
    log.trace('');
    log.trace('↓↓↓↓↓↓↓↓↓↓↓  Error Message  ↓↓↓↓↓↓↓↓↓↓↓');
    log.trace('');
    log.trace(err);
    log.trace('');
    log.trace('↑↑↑↑↑↑↑↑↑↑↑  Error Message  ↑↑↑↑↑↑↑↑↑↑↑');
    // log.error('');
  }
  if (isYargsError) {
    // eslint-disable-next-line no-console
    console.log('');
    // @ts-ignore
    String(this.showHelp());
    // eslint-disable-next-line no-console
    console.log('');
  }
  process.exit(1);
}
