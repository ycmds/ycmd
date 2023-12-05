// #!/usr/bin/env node
import { createCommand, getCwdInfo, pnpmRecursive, shell } from 'ycmd';

export default createCommand({
  command: 'start',
  describe: 'run build process or execute the application',

  // meta: import.meta,
  async main({ isRoot, cwd }) {
    if (isRoot) {
      await pnpmRecursive(`run start`);
      return;
    }
    const { isLib } = await getCwdInfo({ cwd });
    if (isLib) {
      await shell('ycmd dev');
    } else {
      await shell('node lib');
    }
  },
});
