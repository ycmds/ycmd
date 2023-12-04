import path from 'path';

// import { getLskConfig } from './getLskConfig.js';
import { getNpmGlobal } from './getNpmGlobal.js';
import type { GetPathsParams, LskrcConfig } from './types.js';

export const getPaths = (params: GetPathsParams = {}, { config }: { config?: LskrcConfig } = {}): string[] => {
  const { cwd = process.cwd(), name = '', scriptsDir = 'scripts' } = params;
  const scriptPath = `${scriptsDir}/${name}`;
  // const lskrc = params.lskrc !== false ? getLskConfig({ cwd }) : {};
  // const config = lskrc?.pathexec;
  const dirs = config ? config.dirs : 4;
  const local = config ? config.local : true;
  const nodemodules = config ? config.nodemodules : true;
  const exts = params.exts || [''];
  const paths = (config?.paths || [])
    .map((prefix: any) => exts.map((ext) => path.resolve(`${prefix}/${scriptPath}${ext}`)))
    .flat();
  if (paths.length) return paths;

  const globalNodemodules = [getNpmGlobal(), `/usr/local/lib`].filter(Boolean);
  const nodemodulesPostfix = config?.extends || '/node_modules/ycmd';

  if (local) {
    [...Array(dirs)].forEach((_, deep) => {
      const dir = `${cwd}/${'../'.repeat(deep)}`;
      paths.push(...exts.map((ext) => path.resolve(`${dir}/${scriptPath}${ext}`)));
      if (nodemodules) {
        paths.push(
          ...exts.map((ext) => path.resolve(`${dir}/${nodemodulesPostfix}/${scriptPath}${ext}`)),
        );
      }
    });
  }
  if (nodemodules) {
    // paths.push(
    //   ...exts.map((ext) =>
    //     path.resolve(
    //       `${process.env.HOME}/projects/lskjs-cli/packages/cli-scripts/${scriptPath}${ext}`,
    //     ),
    //   ),
    // );
    globalNodemodules.forEach((dir) => {
      paths.push(
        ...exts.map((ext) => path.resolve(`${dir}${nodemodulesPostfix}/${scriptPath}${ext}`)),
      );
    });
    // globalNodemodules.forEach((dir) => {
    //   paths.push(
    //     ...exts.map((ext) =>
    //       path.resolve(`${dir}/node_modules/@lskjs/cli/${nodemodulesPostfix}/${scriptPath}${ext}`),
    //     ),
    //   );
    // });
    // globalNodemodules.forEach((dir) => {
    //   paths.push(
    //     ...exts.map((ext) =>
    //       path.resolve(
    //         `${dir}/node_modules/lsk/node_modules/@lskjs/cli/${nodemodulesPostfix}/${scriptPath}${ext}`,
    //       ),
    //     ),
    //   );
    // });
  }
  // console.log({paths})

  return paths;
};
