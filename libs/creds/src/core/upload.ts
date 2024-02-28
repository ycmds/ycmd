import { readFile } from 'node:fs/promises';

import { Err } from '@lsk4/err';
import { ILogger } from '@lsk4/log';
import { map } from 'fishbird';

import { GithubService } from '../services/GithubService';
import { GitlabService } from '../services/GitlabService';
import { Service } from '../services/Service';
import { ServiceOptions } from '../types';

type UploadOptions = {
  buildDir?: string;
  log?: ILogger;
} & Partial<ServiceOptions>;

export async function upload(serviceDirname: string, options: UploadOptions) {
  const buildDirDir = options.buildDir || `${serviceDirname}/build`;

  // eslint-disable-next-line import/no-dynamic-require
  const config = require(`${serviceDirname}/config.js`);

  const serviceName = config.service?.serviceName;
  if (!serviceName) throw new Err('!serviceName');

  let service: Service;
  if (serviceName === 'github') {
    service = new GithubService({
      ...config.service,
      ...options,
    });
  } else if (serviceName === 'gitlab') {
    service = new GitlabService({
      ...config.service,
      ...options,
    });
  } else {
    throw new Err('incorrect serviceName', { serviceName });
  }

  const { files: rawFiles = [], variables, secrets, hooks } = config;

  const files = await map(rawFiles, async (fileOptions: any) => {
    const { filename } = fileOptions;
    const content = await readFile(`${buildDirDir}/${filename}`).then((f) => f.toString());
    return {
      ...fileOptions,
      content,
    };
  });
  await service.uploadAll({
    files,
    variables,
    secrets,
    hooks,
  });
}
