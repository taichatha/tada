import type { Command } from "commander";
import { Store, cancelTodo } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerCancelCommand(program: Command) {
  program
    .command("cancel <id>")
    .description("Cancel a todo")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = cancelTodo(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Cancelled "${todo.title}"`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
