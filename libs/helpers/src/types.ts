import type { ILogger } from '@lsk4/log';

export interface MainOptions {
  configPath?: string;
  config: Record<string, any>;
  cmdName: string;
  cmdVersion: string;
  cmdPackage: any;
  nodeBin: string;
  ycmdBin: string;
  log: ILogger;
  cwd: string;
  cwdInfo: Record<string, any>;
  args: string[];
  argv: Record<string, any>;
  [key: string]: any;
}
