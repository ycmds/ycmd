import { loadConfig as loadConfigFile } from '@lsk4/config';
import { z } from 'zod';

const schema = z.object({
  spreadsheet: z.object({
    app: z.object({
      client_id: z.string(),
      project_id: z.string(),
      auth_uri: z.string(),
      token_uri: z.string(),
      auth_provider_x509_cert_url: z.string(),
      client_secret: z.string(),
      redirect_uris: z.array(z.string()),
    }),
    token: z
      .object({
        access_token: z.string(),
        refresh_token: z.string(),
        scope: z.string(),
        token_type: z.string(),
        expiry_date: z.number(),
      })
      .optional(),
  }),
});

export type Config = z.infer<typeof schema>;

export const loadConfig = async () => {
  const res = await loadConfigFile<Config>('.ycmd.config', {
    schema,
    throwError: true,
    packageKey: 'ycmd',
  });
  return res;
};
