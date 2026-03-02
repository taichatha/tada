import type { Command } from "commander";
import { Store, getTodo, updateTodo } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerTagCommand(program: Command) {
  program
    .command("tag <id> <tags...>")
    .description("Add tags to a todo")
    .action(async (id: string, tags: string[]) => {
      try {
        const store = new Store();
        const data = await store.load();

        const existing = getTodo(data, id);
        if (!existing) throw new Error(`No todo found with ID prefix "${id}"`);

        const merged = [...new Set([...existing.tags, ...tags])];
        const todo = updateTodo(data, id, { tags: merged });
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Tagged "${todo.title}" with ${tags.join(", ")}`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
