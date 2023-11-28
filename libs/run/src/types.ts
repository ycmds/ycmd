import type { SpawnOptions } from '@ycmd/spawn';
import type { Logger } from '@ycmd/utils';
import { LskrcConfig } from '@ycmd/utils';
import { ArgumentsCamelCase, CommandBuilder } from 'yargs';

export type Ctx = any;
export interface CtxOptions {
  isRoot: boolean;
  ctx: Ctx;
  cwd: string;
  args: string[];
  log: Logger;
  config: LskrcConfig;
}

export interface RootRun extends CtxOptions {
  shell: string;
  filename: string;
}

export interface PathexecCtx {
  rootRun: RootRun;
}

export type PathexecProcess = typeof process & { pathexec?: PathexecCtx };
export type LskrunProcess = typeof process & { lskrun?: RootRun; lskrunDisableAutorun?: boolean };

export interface MainOptions {
  rootRun?: RootRun;
  args?: string[];
  [key: string]: any; // Additional properties
}

export interface ShellOptions extends SpawnOptions {
  silence?: boolean | 'all';
  ctx?: any;
  args?: string[];
  argv?: Record<string, any>;
}

export interface ShellParallelOptions extends ShellOptions {
  npmClient?: 'npm' | 'yarn' | 'pnpm';
  parallel?: boolean; // without frame
}

export interface PathexecOptions extends SpawnOptions {
  args?: string[];
  argv?: Record<string, any>;
  log?: any; // Replace 'any' with the actual type of your logger
  ctx?: any; // Replace 'any' with the actual type of your context
  cwd?: string;
  name?: string;
  cmdName?: string;
}

export type MainFunction = (props: MainOptions) => Promise<any>;
export type WrappedMainFunction = (props: any) => Promise<any>;

export interface PartMainCommand {
  main?: MainFunction;
  meta?: ImportMeta;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export interface MainCommand<T = {}, U = {}> extends PartMainCommand {
  /** array of strings (or a single string) representing aliases of `exports.command`, positional args defined in an alias are ignored */
  aliases?: ReadonlyArray<string> | string | undefined;
  /** object declaring the options the command accepts, or a function accepting and returning a yargs instance */
  builder?: CommandBuilder<T, U> | undefined;
  /** string (or array of strings) that executes this command when given on the command line, first string may contain positional args */
  command: ReadonlyArray<string> | string | undefined;
  /** boolean (or string) to show deprecation notice */
  deprecated?: boolean | string | undefined;
  /** string used as the description for the command in help text, use `false` for a hidden command */
  describe?: string | false | undefined;
  /** a function which will be passed the parsed argv. */
  handler?: (args: ArgumentsCamelCase<U>) => void | Promise<void>;
}

export type CreateCommandParams = MainFunction | PartMainCommand | MainCommand;

export type CreateCommandResult = MainCommand & {
  main: WrappedMainFunction;
  isAutorun: boolean;
  res?: any | Promise<any>;
};
