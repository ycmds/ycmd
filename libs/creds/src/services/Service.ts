import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { map } from 'fishbird';

import type { Secrets, ServiceOptions } from '../types';

export class Service {
  projectId!: string;
  projectName!: string;
  projectPath!: string;
  projectCredsUrl!: string;

  token!: string;
  server!: string;
  force!: boolean;

  client: AxiosInstance;
  log = createLogger(this.constructor.name);

  constructor(options: ServiceOptions) {
    Object.assign(this, options);
    this.checkConfig();
    this.client = this.createClient(options);
    // TODO: сделать такой интерцептор
    // .catch((err) => {
    //   throw new Err(err.message, { data: err?.response?.data });
    //   // console.log(err.response.data);
    // });
  }
  createClient(clientOptions: any): AxiosInstance {
    return axios.create(clientOptions);
  }

  checkConfig() {
    if (!this.projectId) throw new Err('!projectId');
    if (!this.projectName) throw new Err('!projectName');
    if (!this.projectPath) throw new Err('!projectPath');
    if (!this.projectCredsUrl) throw new Err('!projectCredsUrl');
    if (!this.server) throw new Err('!server');
    if (!this.token) throw new Err('!token');
  }
  getBaseUrl(): string {
    throw new Err('NOT_IMPLEMENTED');
  }
  getHeaders() {
    return {};
  }
  getServiceLink(): string {
    throw new Err('NOT_IMPLEMENTED');
  }
  getProjectName() {
    return this.projectName;
  }
  getProjectId() {
    return this.projectId;
  }
  getProjectPath() {
    return this.projectPath;
  }
  getProjectUrl(): string {
    throw new Err('NOT_IMPLEMENTED');
  }
  getProjectCredsUrl() {
    return this.projectCredsUrl;
  }
  getProjectCICDSettingURL(): string {
    throw new Err('NOT_IMPLEMENTED');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadSecret(key: string, content: string) {
    throw new Err('NOT_IMPLEMENTED');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadVariable(key: string, content: string) {
    throw new Err('NOT_IMPLEMENTED');
  }

  async removeOldHooks() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadHook(dataHook: any) {}

  async uploadHooks(env: Secrets): Promise<void> {
    if (!env) throw new Err('!env');
    const { hooks = [] } = env;
    try {
      await this.removeOldHooks();
    } catch (err) {
      this.log.error(`[ERR] Old hooks removing failed:`, Err.getMessage(err));
    }

    await map(hooks, async (dataHook, index) => {
      try {
        await this.uploadHook(dataHook);
        this.log.info(`[OK] Hook ${index} uploaded`);
      } catch (err) {
        this.log.error(`[ERR] Hook ${index} not uploaded:`, Err.getMessage(err));
      }
    });
  }

  async uploadAll(env: Secrets) {
    if (!env) throw new Err('!env');
    const { secrets = {}, variables = {}, files = [] } = env;
    await this.uploadHooks(env);
    await map(Object.entries(secrets), async ([key, value]) => {
      try {
        await this.uploadSecret(key, value);
        this.log.info(`[OK] Secret ${key} uploaded`);
      } catch (err) {
        this.log.error(`[ERR] Secret ${key} not uploaded, because`, Err.getMessage(err));
        this.log.error(err);
      }
    });
    await map(Object.entries(variables), async ([key, value]) => {
      try {
        await this.uploadVariable(key, value);
        this.log.info(`[OK] Variable ${key} uploaded`);
      } catch (err) {
        this.log.error(`[ERR] Variable ${key} not uploaded, because`, Err.getMessage(err));
        // log.error(err);
      }
    });
    await map(files, async ({ name, credType, content }: any) => {
      const key = name;
      const value = content;
      try {
        if (credType === 'variable') {
          await this.uploadVariable(key, value);
        } else if (credType === 'secret') {
          await this.uploadSecret(key, value);
        } else if (credType === 'skip') {
          this.log.debug(`[SKIP] File ${key} uploaded as ${credType}`);
          return;
        } else {
          throw new Err('unknown credType', { credType });
        }
        this.log.info(`[OK] File ${key} uploaded as ${credType}`);
      } catch (err) {
        this.log.error(
          `[ERR] File ${key} not uploaded as ${credType}, because`,
          Err.getMessage(err),
        );
        // log.error(err);
      }
    });
  }
}
