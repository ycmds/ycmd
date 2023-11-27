import type { CommandModule } from 'yargs';

export function createOnComplete({ commands }: { commands: CommandModule[] }) {
  return (current: any, argv: any, done: any) => {
    const completions = commands.map((c: any) => c.command.split(' ')[0]).filter(Boolean);
    done(completions);
  };
}
