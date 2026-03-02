import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { readFile, writeFile, mkdir, rename, access, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import type { TadaStore } from "./types.js";

const STORE_DIR = ".tada";
const STORE_FILE = "store.json";
const REGISTRY_FILE = "registry.json";

function getRegistryPath(): string {
  return join(homedir(), STORE_DIR, REGISTRY_FILE);
}

function ensureGlobalDir(): void {
  const globalDir = join(homedir(), STORE_DIR);
  if (!existsSync(globalDir)) {
    mkdirSync(globalDir, { recursive: true });
  }
}

export function registerStore(tadaDir: string): void {
  ensureGlobalDir();
  const registryPath = getRegistryPath();
  let paths: string[] = [];
  try {
    paths = JSON.parse(readFileSync(registryPath, "utf-8"));
  } catch {
    // No registry yet
  }
  if (!paths.includes(tadaDir)) {
    paths.push(tadaDir);
    writeFileSync(registryPath, JSON.stringify(paths, null, 2) + "\n", "utf-8");
  }
}

export function getRegisteredStores(): string[] {
  try {
    const paths: string[] = JSON.parse(readFileSync(getRegistryPath(), "utf-8"));
    return paths.filter((p) => existsSync(p));
  } catch {
    return [];
  }
}

export type StoreMode = "global" | "local";

function emptyStore(): TadaStore {
  return { version: 1, todos: [], projects: [], areas: [] };
}

export class Store {
  static defaultMode: StoreMode = "local";

  readonly mode: StoreMode;
  readonly rootPath: string;

  private rootDir: string;

  constructor(mode?: StoreMode, rootDir?: string) {
    const resolvedMode = mode ?? Store.defaultMode;
    this.mode = resolvedMode;

    if (resolvedMode === "global") {
      const globalRoot = homedir();
      const tadaDir = join(globalRoot, STORE_DIR);
      // Auto-create global store on first use
      if (!existsSync(tadaDir)) {
        mkdirSync(tadaDir, { recursive: true });
        writeFileSync(
          join(tadaDir, STORE_FILE),
          JSON.stringify(emptyStore(), null, 2) + "\n",
          "utf-8",
        );
      }
      this.rootDir = globalRoot;
      this.rootPath = tadaDir;
    } else {
      const found = Store.findRoot(rootDir);
      if (!found) {
        throw new Error(
          'No .tada/ directory found. Run "tada init" to get started.',
        );
      }
      this.rootDir = found;
      this.rootPath = join(found, STORE_DIR);
      registerStore(this.rootPath);
    }
  }

  private get storePath(): string {
    return join(this.rootDir, STORE_DIR, STORE_FILE);
  }

  private get tadaDir(): string {
    return join(this.rootDir, STORE_DIR);
  }

  async load(): Promise<TadaStore> {
    try {
      const data = await readFile(this.storePath, "utf-8");
      const store = JSON.parse(data) as TadaStore;
      // Backfill parentId for existing todos
      for (const todo of store.todos) {
        if (todo.parentId === undefined) {
          todo.parentId = null;
        }
      }
      return store;
    } catch {
      return emptyStore();
    }
  }

  async save(store: TadaStore): Promise<void> {
    const tmpPath = this.storePath + ".tmp";
    await writeFile(tmpPath, JSON.stringify(store, null, 2) + "\n", "utf-8");
    await rename(tmpPath, this.storePath);
  }

  private get undoPath(): string {
    return join(this.rootDir, STORE_DIR, "store.undo.json");
  }

  async saveWithBackup(store: TadaStore): Promise<void> {
    try {
      const current = await readFile(this.storePath, "utf-8");
      await writeFile(this.undoPath, current, "utf-8");
    } catch {
      // No existing store to backup (first save)
    }
    await this.save(store);
  }

  async undo(): Promise<TadaStore> {
    try {
      await access(this.undoPath);
    } catch {
      throw new Error("Nothing to undo");
    }
    const backup = await readFile(this.undoPath, "utf-8");
    const tmpPath = this.storePath + ".tmp";
    await writeFile(tmpPath, backup, "utf-8");
    await rename(tmpPath, this.storePath);
    await unlink(this.undoPath);
    return JSON.parse(backup) as TadaStore;
  }

  static async init(dir: string = process.cwd()): Promise<Store> {
    const tadaDir = join(dir, STORE_DIR);
    await mkdir(tadaDir, { recursive: true });
    const storePath = join(tadaDir, STORE_FILE);
    try {
      await access(storePath);
      // Already exists, don't overwrite
    } catch {
      await writeFile(
        storePath,
        JSON.stringify(emptyStore(), null, 2) + "\n",
        "utf-8",
      );
    }
    const store = new Store("local", dir);
    registerStore(store.rootPath);
    return store;
  }

  static findRoot(from: string = process.cwd()): string | null {
    const globalRoot = homedir();
    let dir = from;
    while (true) {
      // Skip home directory — that's the global store, not a local one
      if (dir !== globalRoot && existsSync(join(dir, STORE_DIR))) {
        return dir;
      }
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
}
