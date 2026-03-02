import type { Command } from "commander";
import { Store, completeTodo, reopenTodo } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerDoneCommand(program: Command) {
  program
    .command("done <id>")
    .description("Complete a todo")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = completeTodo(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Completed "${todo.title}"`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  program
    .command("undo [id]")
    .description("Undo last action, or reopen a specific todo by ID")
    .action(async (id?: string) => {
      try {
        const store = new Store();
        if (id) {
          const data = await store.load();
          const todo = reopenTodo(data, id);
          await store.saveWithBackup(data);
          console.log(formatSuccess(`Reopened "${todo.title}"`));
        } else {
          await store.undo();
          console.log(formatSuccess("Undone"));
        }
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
