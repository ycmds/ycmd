/* eslint-disable no-console */
import { getLogo, printInfo } from '@ycmd/helpers';
import { CommandModule } from 'yargs';

export const InfoCommand: CommandModule = {
  command: 'info [--extend]',
  aliases: ['i'],
  describe: 'Get info about current project',
  // builder: (yargs) => yargs.default('value', 'true'),
  handler: () => {
    // console.log('import.meta', import.meta);

    // TODO: подумать
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = path.dirname(__filename);
    // const packageJson = readJsonSync(`${__dirname}/../../package.json`);

    // const config = {
    //   name: packageJson?.name,
    //   version: packageJson?.version,
    // };
    const config = {
      name: 'ycmd ??',
      version: '0.0.0 ??',
    };
    console.log(getLogo());
    printInfo({
      log: (...a: any[]) => console.log(...a),
      config,
    });
  },
};
