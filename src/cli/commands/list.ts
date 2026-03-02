import type { Command } from "commander";
import { Store, getInbox } from "../../core/index.js";
import type { SortMode } from "../../core/index.js";
import { formatTodoList, formatError } from "../formatters.js";

export function registerListCommand(program: Command) {
  program
    .command("list")
    .alias("ls")
    .description("List inbox todos (open, no project)")
    .option("--sort <mode>", "Sort by: created, alpha, due", "created")
    .action(async (opts) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getInbox(data, opts.sort as SortMode);
        console.log(formatTodoList(todos, "Inbox"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
