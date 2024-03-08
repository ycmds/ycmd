import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';
import axios from 'axios';
import { map } from 'fishbird';

import { Service } from './Service';

interface GitlabServiceOptions {
  projectId: string;
  projectName: string;
  projectPath: string;
  projectCredsUrl: string;
  projectCredsOwner: string;
  token: string;
  server: string;

  clientOptions: any;
  force: boolean;
}

const force = true;

export class GitlabService extends Service {
  projectId!: string;
  projectName!: string;
  projectPath!: string;
  projectCredsUrl!: string;
  projectCredsOwner!: string;
  token!: string;
  server!: string;
  force: boolean = true;

  log = createLogger(this.constructor.name);

  constructor(options: GitlabServiceOptions) {
    super(options);
    this.assign(options as any);
    this.checkConfig();
    this.client = this.createClient(options.clientOptions);
  }

  checkConfig() {
    if (!this.projectId) throw new Err('!projectId');
    if (!this.server) throw new Err('!server');
    if (!this.projectName) throw new Err('!projectName');
    if (!this.projectPath) throw new Err('!projectPath');
    if (!this.projectCredsUrl) throw new Err('!projectCredsUrl');
    if (!this.projectCredsOwner) throw new Err('!projectCredsOwner');
    if (!this.token) throw new Err('!token');
  }
  createClient(options: any = {}) {
    return axios.create({
      baseURL: `https://${this.server}/api/v4/projects/${this.projectId}`,
      headers: {
        'PRIVATE-TOKEN': this.token,
      },
      ...options,
    });
  }

  getServiceHostname() {
    return this.server;
  }
  getProjectUrl() {
    return `https://${this.getServiceHostname()}/${this.projectPath}`;
  }
  getProjectCICDSettingURL() {
    return `${this.getProjectUrl()}/-/settings/ci_cd`;
  }

  async uploadSecret(key: string, content: string, options: any = {}) {
    const { data: varData } = await this.client({
      method: 'get',
      url: `/variables/${key}`,
    }).catch((err) => {
      if (!force) throw err;
      return { data: { value: '@lskjs/creds' } };
    });

    if (varData.value && varData.value.indexOf('@lskjs/creds') === -1 && !force) {
      this.log.warn(`[IGNORE] Project ${this.projectId} ${key}`);
      return;
    }

    await this.client({
      method: 'delete',
      url: `/variables/${key}`,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});

    await this.client({
      method: 'post',
      url: '/variables',
      data: {
        key,
        variable_type: 'file',
        value: content,
        protected: true,
        ...options,
        // masked: true,
      },
    });
  }
  async uploadVariable(key: string, content: string, options: any = {}) {
    this.uploadSecret(key, content, {
      variable_type: 'env_var',
      protected: Boolean(options.protected || false),
    });
    // this.log.warn("GitLab uploading variable doesn't supported");
    // throw new Err('NOT_IMPLEMENTED');
  }
  async uploadEnv() {
    this.log.warn("GitLab uploading env doesn't supported");
    throw new Err('NOT_IMPLEMENTED');
  }

  async removeOldHooks() {
    const { data: hooksList } = await this.client({
      method: 'get',
      url: `/hooks`,
    }).catch((err) => {
      if (!force) throw err;
      return { data: { value: '@lskjs/creds' } };
    });
    await map(hooksList, async ({ id: hookId }: any) => {
      await this.client({
        method: 'delete',
        url: `/hooks/${hookId}`,
      });
    });
  }
  async uploadHook(hook: any) {
    await this.client({
      method: 'post',
      url: '/hooks',
      data: hook,
    });
  }
}
