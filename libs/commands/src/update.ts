// #!/usr/bin/env node
import { createCommand, shell } from 'ycmd';

export default createCommand({
  command: 'update',
  describe: 'update the package dependencies',

  // meta: import.meta,
  async main({ ctx }) {
    const packages = ['ycmd', '@ycmd/*', '@lsk4/*', '@nestlib/*', '@rckit/*'];
    const packString = packages.map((s) => `"${s}"`).join(' ');
    const latest = true;
    await shell(`pnpm update -r ${packString}`, { ctx, argv: { latest } });
  },
});
