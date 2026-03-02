import type { Command } from "commander";
import chalk from "chalk";
import { Store, createArea, listAreas, deleteArea } from "../../core/index.js";
import { formatAreaLine, formatSuccess, formatEmpty, formatError } from "../formatters.js";

export function registerAreaCommand(program: Command) {
  const cmd = program
    .command("area")
    .description("Manage areas");

  cmd
    .command("add <title>")
    .description("Create a new area")
    .option("-n, --notes <text>", "Add notes")
    .action(async (title: string, opts) => {
      try {
        const store = new Store();
        const data = await store.load();

        const area = createArea(data, {
          title,
          notes: opts.notes,
        });

        await store.saveWithBackup(data);
        console.log(formatSuccess(`Created area "${area.title}" ${area.id.slice(0, 6)}`));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("list")
    .alias("ls")
    .description("List all areas")
    .action(async () => {
      try {
        const store = new Store();
        const data = await store.load();

        const areas = listAreas(data);

        if (areas.length === 0) {
          console.log(formatEmpty("No areas"));
          return;
        }

        console.log("");
        console.log(`  ${chalk.white.bold("Areas")}  ${chalk.dim(`(${areas.length})`)}`);
        console.log("");

        for (const area of areas) {
          const projectCount = data.projects.filter(
            (p) => p.areaId === area.id,
          ).length;
          console.log(`  ${formatAreaLine(area, projectCount)}`);
        }

        console.log("");
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });

  cmd
    .command("delete <id>")
    .alias("rm")
    .description("Delete an area")
    .action(async (id: string) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteArea(data, id);
        await store.saveWithBackup(data);
        console.log(formatSuccess("Deleted area"));
      } catch (err: any) {
        console.error(formatError(err.message));
        process.exit(1);
      }
    });
}
