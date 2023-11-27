export const argvToArgs = (argv: Record<string, any> = {}) => {
  const args: string[] = [];
  Object.keys(argv).forEach((key) => {
    if (key === '_' || key === '$0') return;
    const value = argv[key];
    if (value === true) {
      args.push(`--${key}`);
    } else if (value === false) {
      // skip
    } else {
      args.push(`--${key}=${value}`);
    }
  });
  return args;
};
