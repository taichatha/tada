import type { Command } from "commander";
import chalk from "chalk";
import {
  Store,
  createProject,
  listProjects,
  getProject,
  completeProject,
  deleteProject,
  getProjectTodos,
} from "../../core/index.js";
import {
  formatProjectLine,
  formatProjectDetail,
  formatSuccess,
  formatEmpty,
  formatError,
} from "../formatters.js";

export function registerProjectCommand(program: Command) {
  const cmd = program
    .command("project")
    .description("Manage projects");

  cmd
    .command("add <title>")
    .description("Create a new project")
    .option("-n, --notes <text>", "Add notes")
    .option("-a, --area <id>", "Assign to area")
    .option("-t, --tag <tag>", "Add tag (repeatable)", (val: string, prev: string[]) => [...prev, val], [] as string[])
    .option("-d, --deadline <date>", "Set deadline (YYYY-MM-DD)")
    .action(async (title: string, opts) => {
      try {
        const store = new Store();
        const data = await store.load();

        const project = createProject(data, {
          title,
          notes: opts.notes,
          areaId: opts.area,
          tags: opts.tag,
          deadline: opts.deadline,
        });

        await store.saveWithBackup(data);
        console.log(formatSuccess(`Created project "${project.title}" ${project.id.slice(0, 6)}`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("list")
    .alias("ls")
    .description("List active projects")
    .option("--all", "Include completed projects")
    .action(async (opts) => {
      try {
        const store = new Store();
        const data = await store.load();

        const filter = opts.all ? { status: undefined } : undefined;
        const projects = opts.all ? data.projects : listProjects(data, filter);

        if (projects.length === 0) {
          console.log(formatEmpty("No projects"));
          return;
        }

        console.log("");
        console.log(`  ${chalk.white.bold("Projects")}  ${chalk.dim(`(${projects.length})`)}`);
        console.log("");

        for (const project of projects) {
          const todoCount = data.todos.filter(
            (t) => t.status === "open" && t.projectId === project.id,
          ).length;
          console.log(`  ${formatProjectLine(project, todoCount)}`);
        }

        console.log("");
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("show <id>")
    .description("Show project details and todos")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();

        const project = getProject(data, id);
        if (!project) throw new Error(`No project found with ID prefix "${id}"`);

        const todos = getProjectTodos(data, project.id);
        console.log(formatProjectDetail(project, todos));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("done <id>")
    .description("Complete a project")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        const project = completeProject(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess(`Completed project "${project.title}"`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("delete <id>")
    .alias("rm")
    .description("Delete a project (todos move to inbox)")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteProject(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess("Deleted project (todos moved to inbox)"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
