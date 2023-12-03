import type { ILogger } from '@lsk4/log';

export interface MainOptions {
  config: Record<string, any>;
  nodeBin: string;
  ycmdBin: string;
  log: ILogger;
  cwd: string;
  cwdInfo: Record<string, any>;
  args: string[];
  argv: Record<string, any>;
  [key: string]: any;
}
