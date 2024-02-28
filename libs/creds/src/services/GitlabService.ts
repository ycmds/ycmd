import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';
import axios from 'axios';
import { map } from 'fishbird';

import { Service } from './Service';

export class GitlabService extends Service {
  log = createLogger(this.constructor.name);

  checkConfig(): void {
    super.checkConfig();
    if (!this.projectId) throw new Err('!projectId');
    if (!this.server) throw new Err('!server');
    if (!this.token) throw new Err('!token');
  }
  createClient(options: any) {
    return axios.create({
      baseURL: `https://${this.server}/api/v4/projects/${this.getProjectId()}`,
      headers: {
        'PRIVATE-TOKEN': this.token,
      },
      ...options,
    });
  }

  getServiceLink() {
    return this.server;
  }
  getProjectUrl() {
    return `https://${this.getServiceLink()}/${this.getProjectPath()}`;
  }
  getProjectCICDSettingURL() {
    return `${this.getProjectUrl()}/-/settings/ci_cd`;
  }

  async uploadSecret(key: string, content: string) {
    const { data: varData } = await this.client({
      method: 'get',
      url: `/variables/${key}`,
    }).catch((err) => {
      if (!this.force) throw err;
      return { data: { value: '@lskjs/creds' } };
    });

    if (varData.value && varData.value.indexOf('@lskjs/creds') === -1 && !this.force) {
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
        // masked: true,
      },
    });
  }
  async uploadVariable() {
    this.log.warn("GitLab uploading variable doesn't supported");
    throw new Err('NOT_IMPLEMENTED');
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
      if (!this.force) throw err;
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
