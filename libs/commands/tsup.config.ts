import configs from '@lsk4/tsup-config';

export default configs.map((config) => ({
  ...config,
  dts: false,
}));
