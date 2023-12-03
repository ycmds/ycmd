// #!/usr/bin/env node
import { createCommand, getLogo, printInfo } from 'ycmd';

export default createCommand({
  command: 'info', //  [-e]
  aliases: ['i'],
  describe: 'get info about current project',

  // meta: import.meta,
  async main(options) {
    const [nodeBin, ycmdBin, ...args] = process.argv;
    // console.log('[info]', { options }, process.argv);
    // const config = {
    //   name: 'ycmd ??',
    //   version: '0.0.0 ??',
    // };
    // eslint-disable-next-line no-console
    options.log.info(getLogo());
    // @ts-ignore
    printInfo({
      ...options,
      // eslint-disable-next-line no-console
      log: (...a) => console.log(...a),
      // config,
    });
  },
});
