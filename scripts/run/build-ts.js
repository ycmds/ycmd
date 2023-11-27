#!/usr/bin/env node
const { run, shell, shellParallel, getCwdInfo, findBin } = require('@lskjs/cli-utils');
const { isCI, isDev } = require('@lskjs/env');
const { writeFile } = require('node:fs/promises');
// const { log } = require('@lskjs/log/log');

async function main({ isRoot, ctx, cwd, args, log } = {}) {
  if (isRoot) {
    await shellParallel(`lsk run buiild:ts`, { ctx, args });
    return;
  }
  const isWatch = args.includes('--watch');
  const isProd = !isDev || !!+process.env.LSK_PROD || args.includes('--prod');
  const isSilent = !!+process.env.LSK_SILENT || args.includes('--silent') || isCI;
  const { isLib } = getCwdInfo({ cwd });
  let cmd = '';
  const isNodemon = !isLib && isWatch;
  // console.log({ isNodemon });

  if (isNodemon) {
    const path = 'src/**';
    const ext = 'ts,tsx,js,jsx,mjs,cjs,json';
    cmd = findBin('ts-node');
    cmd += ' src';
    // cmd += ' src/index.ts';
    log.trace('watching path:', path);
    log.trace('watching extensions:', ext);
    log.debug('to restart at any time, enter `rs`');
    // 'nodemon --watch "src/**" --ext "ts,json" --ignore "src/**/*.spec.ts" --exec "ts-node src/index.ts"';
    cmd = `nodemon --watch "${path}" --ext "${ext}" --exec "${cmd}" --quiet`;
  } else {
    cmd = findBin('tsup');
    cmd += ' src';
    if (isSilent) cmd += ' --silent';
    if (isWatch) cmd += ' --watch';
  }
  if (isProd) cmd = `NODE_ENV=production ${cmd}`;

  setTimeout(() => {
    writeFile(`${cwd}/cjs/package.json`, JSON.stringify({ type: 'commonjs' }));
  }, 1000);
  setTimeout(() => {
    writeFile(`${cwd}/lib/package.json`, JSON.stringify({ type: 'module' }));
  }, 1000);
  await shell(cmd, { ctx });
}

module.exports = run(main);
