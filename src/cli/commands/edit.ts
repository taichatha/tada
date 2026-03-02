import type { Command } from "commander";
import { Store, updateTodo, findByPrefixOrThrow } from "../../core/index.js";
import type { RecurrenceRule } from "../../core/index.js";
import { resolveDate } from "../dates.js";
import { formatSuccess, formatError } from "../formatters.js";

export function registerEditCommand(program: Command) {
  program
    .command("edit <id>")
    .description("Edit a todo")
    .option("-n, --notes <text>", "Update notes")
    .option("--title <text>", "Update title")
    .option("-p, --project <id>", "Move to project")
    .option("-t, --tag <tag>", "Set tags (repeatable)", (val: string, prev: string[]) => [...prev, val], [] as string[])
    .option("-d, --deadline <date>", "Set deadline (YYYY-MM-DD, today, tomorrow)")
    .option("-s, --scheduled <date>", "Set scheduled date (YYYY-MM-DD, today, tomorrow)")
    .option("--priority <level>", "Set priority (low, medium, high)")
    .option("--recur <frequency>", "Set recurrence (daily, weekly, monthly, yearly)")
    .option("--every <n>", "Recurrence interval", "1")
    .action(async (id: string, opts) => {
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

        const input: Record<string, any> = {};
        if (opts.title !== undefined) input.title = opts.title;
        if (opts.notes !== undefined) input.notes = opts.notes;
        if (opts.project !== undefined) {
          input.projectId = findByPrefixOrThrow(data.projects, opts.project, "project").id;
        }
        if (opts.tag.length > 0) input.tags = opts.tag;
        if (opts.deadline !== undefined) input.deadline = resolveDate(opts.deadline);
        if (opts.scheduled !== undefined) input.scheduledDate = resolveDate(opts.scheduled);
        if (opts.priority !== undefined) input.priority = opts.priority;
        if (recurrence) input.recurrence = recurrence;

        const todo = updateTodo(data, id, input);
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Updated "${todo.title}"`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
