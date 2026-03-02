import type { Command } from "commander";
import chalk from "chalk";
import { Store, search } from "../../core/index.js";
import type { Todo, Project } from "../../core/index.js";
import { formatTodoLine, formatProjectLine, formatEmpty, formatError } from "../formatters.js";

export function registerSearchCommand(program: Command) {
  program
    .command("search <query>")
    .description("Search todos and projects")
    .action(async (query: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        const results = search(data, query);

        if (results.length === 0) {
          console.log(formatEmpty(`No results for "${query}"`));
          return;
        }

        const todos = results.filter((r) => r.type === "todo").map((r) => r.item as Todo);
        const projects = results.filter((r) => r.type === "project").map((r) => r.item as Project);

        console.log("");
        console.log(`  ${chalk.white.bold("Search")}  ${chalk.dim(`"${query}" — ${results.length} results`)}`);

        if (todos.length > 0) {
          console.log("");
          console.log(`  ${chalk.dim("Todos")}`);
          console.log("");
          for (const todo of todos) {
            console.log(`  ${formatTodoLine(todo)}`);
          }
        }

        if (projects.length > 0) {
          console.log("");
          console.log(`  ${chalk.dim("Projects")}`);
          console.log("");
          for (const project of projects) {
            const todoCount = data.todos.filter(
              (t) => t.status === "open" && t.projectId === project.id,
            ).length;
            console.log(`  ${formatProjectLine(project, todoCount)}`);
          }
        }

        console.log("");
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
