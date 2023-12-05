// #!/usr/bin/env node
import { map } from 'fishbird';
import { createCommand, getShortPath, isFileExist, shellParallel } from 'ycmd';

export default createCommand({
  command: 'build:docker-stack',
  describe: 'build docker stack configurations',

  // meta: import.meta,
  async main({ isRoot, log, ctx, config, cwd }) {
    if (isRoot) {
      await shellParallel(`ycmd build:docker-stack`, { ctx });
      return;
    }
    const { getComment, jsonToFile } = await import('@lskjs/stringify');
    const { rootRepo, envs = ['prod'], rootPath } = config;
    const packagePath = cwd.replace(`${rootPath}/`, '').replace(rootPath, '');
    const packageName = packagePath.split('/').reverse()[0];
    const inputFilename = `${packagePath}/docker-stack.js`;
    if (!(await isFileExist(`${rootPath}/${inputFilename}`))) {
      log.trace('[skip]', getShortPath(inputFilename));
      return;
    }
    const getConfig = (await import(`${rootPath}/${inputFilename}`)).default;
    await map(envs, async (env) => {
      const data = getConfig({ env, package: packageName });
      const postfix = env !== 'prod' ? `.${env}` : '';
      const outputFilename = `${packagePath}/docker-stack${postfix}.yml`;
      log.trace(
        '[save]',
        `env:${env} ${getShortPath(inputFilename)} => ${getShortPath(outputFilename)}`,
      );
      await jsonToFile(`${rootPath}/${outputFilename}`, data, {
        type: 'yml',
        comment: getComment({
          name: outputFilename,
          url: `${rootRepo}/${inputFilename}`,
        }),
      });
    });
  },
});
