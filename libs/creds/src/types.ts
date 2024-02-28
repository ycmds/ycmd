export type SecretFile = {
  name: string;
  filename: string;
  credType?: string;
  content?: string;
  handler: (arg0: any) => Record<string, any>;
};

export type Secrets = {
  secrets?: Record<string, string>;
  variables?: Record<string, string>;
  files?: Array<SecretFile>;
  hooks?: Array<any>;
};

export type ServiceOptions = {
  projectId?: string;
  projectName?: string;
  projectPath?: string;
  projectCredsUrl?: string;
  token: string;
  server: string;
  force: boolean;
};
