import type { Command } from "commander";
import { Store, deleteTodo } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerDeleteCommand(program: Command) {
  program
    .command("delete <id>")
    .alias("rm")
    .description("Permanently delete a todo")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteTodo(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess("Deleted todo"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
