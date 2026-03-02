import type { Command } from "commander";
import { Store, addTodo, findByPrefixOrThrow } from "../../core/index.js";
import type { RecurrenceRule } from "../../core/index.js";
import { resolveDate } from "../dates.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerAddCommand(program: Command) {
  program
    .command("add <title>")
    .description("Add a new todo")
    .option("-n, --notes <text>", "Add notes")
    .option("-p, --project <id>", "Assign to project")
    .option("-t, --tag <tag>", "Add tag (repeatable)", (val: string, prev: string[]) => [...prev, val], [] as string[])
    .option("-d, --deadline <date>", "Set deadline (YYYY-MM-DD, today, tomorrow)")
    .option("-s, --scheduled <date>", "Set scheduled date (YYYY-MM-DD, today, tomorrow)")
    .option("--priority <level>", "Set priority (low, medium, high)")
    .option("-P, --parent <id>", "Add as subtask of parent todo")
    .option("--recur <frequency>", "Set recurrence (daily, weekly, monthly, yearly)")
    .option("--every <n>", "Recurrence interval (default: 1)", "1")
    .action(async (title: string, opts) => {
      try {
        const store = new Store();
        const data = await store.load();

        let recurrence: RecurrenceRule | undefined;
        if (opts.recur) {
          recurrence = {
            frequency: opts.recur,
            interval: parseInt(opts.every, 10),
          };
        }

        const projectId = opts.project
          ? findByPrefixOrThrow(data.projects, opts.project, "project").id
          : undefined;

        const parentId = opts.parent
          ? findByPrefixOrThrow(data.todos, opts.parent, "todo").id
          : undefined;

        const todo = addTodo(data, {
          title,
          notes: opts.notes,
          projectId,
          parentId,
          tags: opts.tag,
          deadline: resolveDate(opts.deadline),
          scheduledDate: resolveDate(opts.scheduled),
          priority: opts.priority,
          recurrence,
        });

        await store.saveWithBackup(data);
        console.log(formatSuccess(`Added "${todo.title}" ${todo.id.slice(0, 6)}`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
