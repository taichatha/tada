import type { Command } from "commander";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import chalk from "chalk";
import { Store, getRegisteredStores } from "../../core/index.js";

function abbreviate(path: string): string {
  const home = homedir();
  if (path === home || path === home + "/") return "~";
  if (path.startsWith(home + "/")) return "~/" + path.slice(home.length + 1);
  return path;
}

export function registerStoresCommand(program: Command) {
  program
    .command("stores")
    .description("List all known tada stores")
    .action(async () => {
      const home = homedir();
      const globalPath = join(home, ".tada");
      const globalExists = existsSync(globalPath);

      console.log("");
      console.log(`  ${chalk.white.bold("Stores")}`);
      console.log("");

      // Global store
      if (globalExists) {
        const label = Store.defaultMode === "global" ? chalk.green(" (active)") : "";
        console.log(`  ${chalk.cyan("global")}  ${chalk.dim(abbreviate(globalPath))}${label}`);
      } else {
        console.log(`  ${chalk.cyan("global")}  ${chalk.dim("~/.tada")} ${chalk.dim("(not created)")}`);
      }

      // Local stores from registry
      const locals = getRegisteredStores();
      const localRoot = Store.findRoot();
      const activePath = localRoot ? join(localRoot, ".tada") : null;

      if (locals.length === 0) {
        console.log(`  ${chalk.dim("No local stores found")}`);
      } else {
        for (const storePath of locals) {
          const isActive = Store.defaultMode === "local" && storePath === activePath;
          const label = isActive ? chalk.green(" (active)") : "";
          console.log(`  ${chalk.cyan("local")}   ${chalk.dim(abbreviate(storePath))}${label}`);
        }
      }

      console.log("");
    });
}
