import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';
import axios from 'axios';
import _sodium from 'libsodium-wrappers';

import { Service } from './Service';

export class GithubService extends Service {
  log = createLogger(this.constructor.name);

  checkConfig(): void {
    super.checkConfig();
    if (!this.projectId) throw new Err('!projectId');
    if (!this.server) throw new Err('!server');
    if (!this.token) throw new Err('!token');
  }
  createClient(options: any) {
    const server = this.server || 'api.github.com';
    const baseURL = `https://${server}/repos/${this.getProjectPath()}`;
    return axios.create({
      baseURL,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      ...options,
    });
  }

  getServiceLink() {
    return 'github.com';
  }
  getProjectUrl() {
    return `https://${this.getServiceLink()}/${this.projectName}`;
  }
  getProjectCICDSettingURL() {
    return `${this.getProjectUrl()}/settings/secrets/actions`;
  }
  async uploadSecret(key: string, content: string) {
    const { data: publicKeyData } = await this.client({
      method: 'get',
      url: `/actions/secrets/public-key`,
    }).catch((err) => {
      // TODO: сделать такой интерцептор
      throw new Err(err.message, { data: err?.response?.data });
      // console.log(err.response.data);
    });
    // console.log({ publicKeyData });

    if (!publicKeyData?.key) throw new Err('!publicKey');
    if (!publicKeyData?.key_id) throw new Err('!publicKeyId');

    await _sodium.ready;
    const sodium = _sodium;
    const binkey = sodium.from_base64(publicKeyData.key, sodium.base64_variants.ORIGINAL);
    const binsec = sodium.from_string(content);
    const encBytes = sodium.crypto_box_seal(binsec, binkey);
    const output = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

    await this.client({
      method: 'put',
      url: `/actions/secrets/${key}`,
      data: {
        encrypted_value: output,
        key_id: publicKeyData.key_id,
      },
    });
  }
  async uploadVariable(key: string, content: string) {
    const { data: varData, status } = await this.client({
      method: 'get',
      url: `/actions/variables/${key}`,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch((err) => err?.response);
    if (status === 404) {
      await this.client({
        method: 'post',
        url: `/actions/variables`,
        data: {
          name: key,
          value: content,
        },
      });
    }
    if (status === 200 && varData.name.toLowerCase() === key.toLowerCase()) {
      await this.client({
        method: 'patch',
        url: `/actions/variables/${key}`,
        data: {
          name: key,
          value: content,
        },
      });
    }
  }
  uploadHook(): Promise<void> {
    throw new Err('Github hooks not supported yet');
  }
}
