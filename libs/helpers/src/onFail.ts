import { Err } from '@lsk4/err';
import { log } from '@ycmd/utils';

export function onFail(msg: string, err: any) {
  const errorMessage = msg || Err.getMessage(err);
  const isYargsError = !!msg; // && err.name === 'YError';
  if (errorMessage) {
    log.fatal('');
    const showDisclaimer = !isYargsError && Err.getCode(err) !== 'YCMD_MISSING_SCRIPT';
    if (showDisclaimer) {
      // console.log({ msg, err });
      log.fatal('↑↑↑↑↑↑↑↑↑↑↑  Error Message  ↑↑↑↑↑↑↑↑↑↑↑');
      log.fatal('');
    }
    const errCode = Err.getCode(err);
    const exitCode = err?.proc?.exitCode;
    if (errCode) log.fatal('Code:    ', errCode);
    if (exitCode !== errorMessage) log.fatal('Message: ', errorMessage);
    if (err?.cwd) log.fatal('Cwd:', err.cwd);
    if (err?.proc?.spawnargs) {
      log.fatal('Command:', err.proc.spawnargs.join(' '));
    } else if (err?.command) {
      log.fatal('Command:', err.command);
    }
    if (exitCode) log.fatal('ExitCode:', exitCode);
    if (err?.proc?.pid) log.fatal('PID:', err?.proc?.pid);
    if (err?.options?.ctx?.stack) {
      log.fatal('Stack:');
      (err?.options?.ctx?.stack || []).reverse().forEach((s: any) => {
        log.fatal('  ', s?.command);
        if (s?.filename) log.fatal('   ❯', s?.filename);
        // log.fatal('  ', s?.options?.cwd);
      });
    }
    log.fatal('');
  }
  if (err) {
    // log.error('');
    log.trace('[err]', err);
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
