import type { Command } from "commander";
import { Store, updateTodo, findByPrefixOrThrow } from "../../core/index.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerMoveCommand(program: Command) {
  program
    .command("move <id>")
    .description("Move a todo to a project or back to inbox")
    .option("-p, --project <projectId>", "Move to project")
    .option("--inbox", "Move to inbox (remove from project)")
    .action(async (id: string, opts) => {
      try {
        const store = new Store();
        const data = await store.load();

        if (opts.inbox) {
          const todo = updateTodo(data, id, { projectId: null });
          await store.saveWithBackup(data);
          console.log(formatSuccess(`Moved "${todo.title}" to inbox`));
        } else if (opts.project) {
          const project = findByPrefixOrThrow(data.projects, opts.project, "project");
          const todo = updateTodo(data, id, { projectId: project.id });
          await store.saveWithBackup(data);
          console.log(formatSuccess(`Moved "${todo.title}" to project`));
        } else {
          console.error(formatError("Specify --project <id> or --inbox"));
          process.exit(1);
        }
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
