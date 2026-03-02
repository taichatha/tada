# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is tada?

A Things 2-inspired CLI todo manager with MCP server integration for AI coding assistants. Three layers: core business logic, CLI (Commander.js + chalk), and MCP server (@modelcontextprotocol/sdk).

## Commands

```bash
npm run dev -- <command>     # Run CLI in dev mode (e.g., npm run dev -- add "task")
npm run dev:mcp              # Start MCP server in dev mode
npm test                     # Run all tests (vitest)
npm run test:watch           # Watch mode
npm run lint                 # Type-check (tsc --noEmit)
npm run build                # Build with tsup
```

Run a single test file:
```bash
npx vitest run src/test/core/todo.test.ts
```

## Architecture

```
src/
  core/     # Pure business logic — no I/O awareness of CLI or MCP
  cli/      # Commander.js CLI layer (bin: tada)
  mcp/      # MCP server layer (stdio transport)
  test/     # Vitest tests
```

**Core** (`src/core/`) is the foundation. All functions take a `TadaStore` object, mutate it in memory, and return results. Callers (CLI/MCP) handle `Store.load()` and `Store.save()`. This keeps core testable without filesystem.

**Store** (`src/core/store.ts`) handles `.tada/` directory discovery (walks up from cwd like git), JSON persistence with atomic writes (write to `.tmp`, rename), and schema versioning.

**CLI** (`src/cli/`) registers Commander.js commands. Each command file exports a `register*Command(program)` function. The `formatters.ts` module handles all terminal output with chalk.

**MCP** (`src/mcp/`) exposes the same functionality as tools. Each tool handler: loads store, calls core function, saves, returns JSON. Errors use `{ isError: true }`.

## Key Patterns

- **IDs**: 8-char alphanumeric nanoid. CLI supports prefix matching (e.g., `tada done k3x`).
- **Dates**: Always use `date-fns` `format(new Date(), "yyyy-MM-dd")` for local dates. Never use `toISOString().slice(0,10)` (UTC mismatch).
- **Date shorthands**: CLI resolves "today"/"tomorrow" via `src/cli/dates.ts` `resolveDate()`.
- **Storage**: Single `.tada/store.json` per project. `TadaStore` has `version: 1` for future migrations.
- **Today view**: Shows todos where `scheduledDate <= today` OR `deadline <= today`.
- **Recurrence**: On completion of a recurring todo, a new todo is spawned with the next `scheduledDate`.

## Data Model

- **Todo**: id, title, notes, status (open/completed/cancelled), priority, tags, projectId, scheduledDate, deadline, recurrence
- **Project**: groups todos. Deleting orphans todos to inbox.
- **Area**: groups projects. Deleting nullifies areaId on projects.

## Testing

Tests live in `src/test/core/`. They use in-memory `TadaStore` objects (no filesystem) via helpers in `src/test/core/helpers.ts`. Store tests use real temp directories.
