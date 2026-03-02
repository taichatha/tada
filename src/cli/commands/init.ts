import type { Command } from "commander";
import { Store } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerInitCommand(program: Command) {
  program
    .command("init")
    .description("Initialize a new tada project in the current directory")
    .action(async () => {
      try {
        await Store.init();
        console.log(formatSuccess("Initialized .tada/ in current directory"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
