import type { Command } from "commander";
import { Store, getTodo, updateTodo } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerUntagCommand(program: Command) {
  program
    .command("untag <id> <tags...>")
    .description("Remove tags from a todo")
    .action(async (id: string, tags: string[]) => {
      try {
        const store = new Store();
        const data = await store.load();

        const existing = getTodo(data, id);
        if (!existing) throw new Error(`No todo found with ID prefix "${id}"`);

        const filtered = existing.tags.filter((t) => !tags.includes(t));
        const todo = updateTodo(data, id, { tags: filtered });
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Removed tags from "${todo.title}"`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
