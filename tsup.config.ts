import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "cli/index": "src/cli/index.ts",
    "mcp/index": "src/mcp/index.ts",
    "core/index": "src/core/index.ts",
    "tui/index": "src/tui/index.tsx",
  },
  format: ["esm"],
  target: "node20",
  splitting: true,
  sourcemap: true,
  clean: true,
  dts: true,
});
