import { mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Store } from "../../core/store.js";
import type { TadaStore } from "../../core/types.js";

async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "tada-test-"));
}

describe("Store", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await makeTempDir();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe("init", () => {
    it("creates .tada directory and store.json", async () => {
      await Store.init(tempDir);

      expect(existsSync(join(tempDir, ".tada"))).toBe(true);
      expect(existsSync(join(tempDir, ".tada", "store.json"))).toBe(true);
    });

    it("writes a valid empty store", async () => {
      await Store.init(tempDir);

      const raw = await readFile(
        join(tempDir, ".tada", "store.json"),
        "utf-8",
      );
      const data = JSON.parse(raw) as TadaStore;
      expect(data).toEqual({ version: 1, todos: [], projects: [], areas: [] });
    });

    it("does not overwrite an existing store", async () => {
      await Store.init(tempDir);

      // Modify the store
      const storePath = join(tempDir, ".tada", "store.json");
      const modified: TadaStore = {
        version: 1,
        todos: [],
        projects: [],
        areas: [
          {
            id: "test1234",
            title: "Existing",
            notes: "",
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
      };
      await writeFile(storePath, JSON.stringify(modified), "utf-8");

      // Init again
      await Store.init(tempDir);

      const raw = await readFile(storePath, "utf-8");
      const data = JSON.parse(raw) as TadaStore;
      expect(data.areas).toHaveLength(1);
      expect(data.areas[0].title).toBe("Existing");
    });

    it("returns a Store instance", async () => {
      const store = await Store.init(tempDir);
      expect(store).toBeInstanceOf(Store);
    });
  });

  describe("load and save", () => {
    it("round-trips data correctly", async () => {
      const store = await Store.init(tempDir);

      const data: TadaStore = {
        version: 1,
        todos: [
          {
            id: "todo0001",
            title: "Buy milk",
            notes: "2%",
            status: "open",
            priority: "medium",
            tags: ["groceries"],
            projectId: null,
            areaId: null,
            scheduledDate: "2025-06-01",
            deadline: null,
            recurrence: null,
            parentId: null,
            completedAt: null,
            createdAt: "2025-01-01T00:00:00.000Z",
            updatedAt: "2025-01-01T00:00:00.000Z",
          },
        ],
        projects: [],
        areas: [],
      };

      await store.save(data);
      const loaded = await store.load();
      expect(loaded).toEqual(data);
    });

    it("load returns empty store when file is missing", async () => {
      // Create .tada dir but no store.json
      await mkdir(join(tempDir, ".tada"), { recursive: true });
      const store = new Store("local", tempDir);
      const data = await store.load();
      expect(data).toEqual({ version: 1, todos: [], projects: [], areas: [] });
    });

    it("save performs atomic write via tmp file", async () => {
      const store = await Store.init(tempDir);
      const data: TadaStore = {
        version: 1,
        todos: [],
        projects: [],
        areas: [],
      };

      await store.save(data);

      // After save, the tmp file should not exist
      const tmpPath = join(tempDir, ".tada", "store.json.tmp");
      expect(existsSync(tmpPath)).toBe(false);

      // The main file should exist with correct content
      const raw = await readFile(
        join(tempDir, ".tada", "store.json"),
        "utf-8",
      );
      expect(JSON.parse(raw)).toEqual(data);
    });
  });

  describe("findRoot", () => {
    it("finds .tada in the given directory", async () => {
      await Store.init(tempDir);
      const root = Store.findRoot(tempDir);
      expect(root).toBe(tempDir);
    });

    it("walks up directories to find .tada", async () => {
      await Store.init(tempDir);
      const nested = join(tempDir, "a", "b", "c");
      await mkdir(nested, { recursive: true });

      const root = Store.findRoot(nested);
      expect(root).toBe(tempDir);
    });

    it("returns null when no .tada directory exists", async () => {
      // Use a fresh temp dir with no .tada
      const emptyDir = await makeTempDir();
      try {
        const root = Store.findRoot(emptyDir);
        expect(root).toBeNull();
      } finally {
        await rm(emptyDir, { recursive: true, force: true });
      }
    });
  });

  describe("constructor", () => {
    it("throws when no .tada directory is found", () => {
      expect(() => new Store("local", tempDir)).toThrow(
        'No .tada/ directory found. Run "tada init" to get started.',
      );
    });
  });
});
