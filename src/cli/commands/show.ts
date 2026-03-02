import type { Command } from "commander";
import { Store, getTodo, getProject, getSubtasks } from "../../core/index.js";
import { formatTodoDetail, formatProjectDetail, formatError } from "../formatters.js";

export function registerShowCommand(program: Command) {
  program
    .command("show <id>")
    .description("Show full details of a todo or project")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();

        const todo = getTodo(data, id);
        if (todo) {
          const subtasks = getSubtasks(data, todo.id);
          console.log(formatTodoDetail(todo, subtasks));
          return;
        }

        const project = getProject(data, id);
        if (project) {
          const todos = data.todos.filter(
            (t) => t.status === "open" && t.projectId === project.id,
          );
          console.log(formatProjectDetail(project, todos));
          return;
        }

        throw new Error(`No todo or project found with ID prefix "${id}"`);
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
