import type { Command } from "commander";
import { Store, getToday } from "../../core/index.js";
import type { SortMode } from "../../core/index.js";
import { formatTodoList, formatError } from "../formatters.js";

export function registerTodayCommand(program: Command) {
  program
    .command("today")
    .description("Show todos scheduled for today or overdue")
    .option("--sort <mode>", "Sort by: created, alpha, due", "created")
    .action(async (opts) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getToday(data, opts.sort as SortMode);
        console.log(formatTodoList(todos, "Today"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
