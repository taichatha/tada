import type { Command } from "commander";
import { Store, getUpcoming } from "../../core/index.js";
import type { SortMode } from "../../core/index.js";
import { formatTodoList, formatError } from "../formatters.js";

export function registerUpcomingCommand(program: Command) {
  program
    .command("upcoming")
    .description("Show upcoming scheduled todos")
    .option("--sort <mode>", "Sort by: created, alpha, due", "created")
    .action(async (opts) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getUpcoming(data, opts.sort as SortMode);
        console.log(formatTodoList(todos, "Upcoming"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
