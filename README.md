# tada

A CLI todo manager with TUI and MCP server for AI assistants.

```
npm install -g tadacli
```

## Quick Start

```bash
tada init          # Create a .tada/ store in current directory
tada add "My task" # Add a todo
tada               # Launch the TUI
```

## CLI Commands

```bash
# Todos
tada add "title"              # Add a todo
tada add "title" -P <id>      # Add as subtask
tada ls                       # List inbox
tada today                    # Show today's todos
tada done <id>                # Complete a todo
tada cancel <id>              # Cancel a todo
tada undo                     # Undo last action
tada undo <id>                # Reopen a specific todo
tada edit <id> --title "new"  # Edit a todo
tada delete <id>              # Delete a todo
tada move <id> -p <project>   # Move to project
tada tag <id> work            # Add tags
tada untag <id> work          # Remove tags
tada search <query>           # Search todos

# Projects
tada project add "title"      # Create a project
tada project ls               # List projects
tada project show <id>        # Show project details
tada project done <id>        # Complete project
tada project delete <id>      # Delete project (todos go to inbox)

# Areas
tada area add "title"         # Create an area
tada area ls                  # List areas
tada area delete <id>         # Delete area

# Store management
tada stores                   # List all known tada stores
tada -g ls                    # Use global store (~/.tada)
```

## TUI

Run `tada` to launch the interactive terminal UI.

### Layout

```
+------------------+-------------------------------+
| Sidebar          | Main Panel                    |
|                  |                               |
| 1 Inbox     (3)  |   Inbox (3)                  |
| 2 Today     (1)  |                              |
| 3 Upcoming       |   > o Task one               |
| 4 Projects  (1)  |     o Task two               |
| 5 Areas          |     > Subtask a              |
| 6 Logbook   (2)  |     o Task three             |
| 7 Search         |                              |
+------------------+-------------------------------+
| hjkl:nav  a:add  d:done  x:del  u:undo  ?:help  |
+--------------------------------------------------+
```

### Keybindings

| Key | Action |
|-----|--------|
| `j/k` | Move up/down |
| `h/l` | Switch sidebar/main |
| `1-7` | Jump to view |
| `a` | Add todo |
| `A` | Add subtask under selected |
| `d` | Mark done / reopen |
| `x` | Delete |
| `m` | Move to project |
| `u` | Undo last action |
| `s` | Cycle sort (created/alpha/due) |
| `c` | Toggle completed |
| `g` | Toggle global/local store |
| `/` | Search |
| `Enter` | Expand subtasks / open detail |
| `?` | Help |
| `q` | Quit |

### Views

- **Inbox** - Todos with no project, no scheduled date
- **Today** - Todos scheduled for today or with today's deadline
- **Upcoming** - Todos scheduled for future dates
- **Projects** - Grouped by project, expandable
- **Areas** - Organizational groups for projects
- **Logbook** - Completed and cancelled todos
- **Search** - Full-text search across todos

## MCP Server

tada includes an MCP server for AI coding assistants like Claude Code.

```bash
tada mcp   # Start the MCP server (stdio transport)
```

### Available Tools

| Tool | Description |
|------|-------------|
| `todo_add` | Create a todo |
| `todo_list` | List todos with filters |
| `todo_complete` | Complete a todo |
| `todo_update` | Update todo fields |
| `todo_delete` | Delete a todo |
| `todo_reopen` | Reopen a completed todo |
| `todo_cancel` | Cancel a todo |
| `undo` | Undo last mutation |
| `project_create` | Create a project |
| `project_list` | List projects |
| `project_show` | Show project with todos |
| `project_complete` | Complete a project |
| `project_delete` | Delete a project |
| `area_create` | Create an area |
| `area_list` | List areas |
| `area_delete` | Delete an area |

### Claude Code Integration

Add to your MCP config:

```json
{
  "mcpServers": {
    "tada": {
      "command": "tada",
      "args": ["mcp"]
    }
  }
}
```

## Demo: TUI Walkthrough

Launch the TUI with `tada` and follow along.

### Navigation

1. The app opens to the **Inbox** view with the main panel focused
2. Press `j`/`k` to move the cursor up and down through todos
3. Press `h` to move focus to the sidebar, `l` to move back to main
4. Press `1`-`7` or use `j`/`k` in the sidebar + `Enter` to switch views

### Adding todos

1. Press `a` to open the quick-add bar at the bottom
2. Type a todo with inline syntax: `Deploy to staging #devops !high @today due:2026-03-15`
3. Press `Enter` to add, `Esc` to cancel
4. In the **Projects** view, expand a project with `Enter`, then press `a` — the todo is auto-assigned to that project

### Subtasks

1. Select a todo and press `A` (Shift+A)
2. The quick-add bar shows `[subtask of "Parent"]` context
3. Type the subtask title and press `Enter`
4. The parent shows a `[0/1]` progress counter
5. Press `Enter` on the parent to expand and see subtasks inline

### Completing and deleting

1. Press `d` on an open todo to mark it done (press `d` again on a completed todo to reopen)
2. Press `x` to delete — a confirmation prompt appears, press `y` to confirm
3. Press `u` to undo the last action

### Moving todos between projects

1. Select a todo and press `m`
2. A project picker appears — use `j`/`k` to select a project (or Inbox)
3. Press `Enter` to move

### Sorting and filtering

1. Press `s` to cycle sort mode: created date, alphabetical, due date
2. Press `c` to toggle showing completed todos
3. Press `/` to open search, type a query, then `Enter` to browse results

### Detail view

1. Press `Enter` on a todo (without subtasks) to open the detail panel
2. Shows title, status, priority, tags, dates, notes, and subtasks
3. From detail: `d` to complete, `x` to delete, `m` to move, `Esc` to close

### Switching stores

1. Press `g` from any pane to toggle between local and global store
2. The sidebar shows the current store path — it scrolls when the sidebar is focused

## Demo: CLI Walkthrough

A start-to-finish demo using only the CLI.

### 1. Initialize and add todos

```bash
$ tada init
  ✓  Initialized .tada/ in current directory

$ tada add "Design landing page" -t design --priority high -s today
  ✓  Added "Design landing page" a1b2c3

$ tada add "Write API docs" -t docs -d 2026-03-15
  ✓  Added "Write API docs" d4e5f6

$ tada add "Set up CI pipeline" -t infra
  ✓  Added "Set up CI pipeline" g7h8i9
```

### 2. Organize with projects

```bash
$ tada project add "Website Redesign"
  ✓  Created project "Website Redesign" j0k1l2

$ tada move a1b2 -p j0k1
  ✓  Moved "Design landing page" to project

$ tada move d4e5 -p j0k1
  ✓  Moved "Write API docs" to project
```

### 3. Add subtasks

```bash
$ tada add "Hero section" -P a1b2
  ✓  Added "Hero section" m3n4o5

$ tada add "Footer layout" -P a1b2
  ✓  Added "Footer layout" p6q7r8
```

### 4. Work through tasks

```bash
$ tada today
  Today (1)
  ○  !!!  Design landing page  #design  j0k1l2

$ tada done m3n4
  ✓  Completed "Hero section"

$ tada done p6q7
  ✓  Completed "Footer layout"

$ tada done a1b2
  ✓  Completed "Design landing page"
```

### 5. Undo a mistake

```bash
$ tada undo
  ✓  Undone

$ tada ls
  # "Design landing page" is back to open
```

### 6. Tags, deadlines, and search

```bash
$ tada tag g7h8 urgent
  ✓  Tagged "Set up CI pipeline" with urgent

$ tada edit g7h8 -d 2026-03-10
  ✓  Updated "Set up CI pipeline"

$ tada search "CI"
  ○  Set up CI pipeline  #infra #urgent  2026-03-10  g7h8i9
```

### 7. Global store

```bash
$ tada add "Buy groceries" -g
  ✓  Added "Buy groceries" s9t0u1

$ tada ls -g
  Inbox (1)
  ○  Buy groceries  s9t0u1

$ tada stores
  Stores
  global  ~/.tada
  local   ~/projects/myapp/.tada (active)
```

## Data Model

### Todos

Each todo has: title, notes, status (open/completed/cancelled), priority (none/low/medium/high), tags, scheduled date, deadline, recurrence, and optional parent (for subtasks).

IDs are 8-character alphanumeric strings. CLI commands accept unambiguous prefixes (e.g., `tada done k3x`).

### Projects & Areas

- **Projects** group related todos. Deleting a project moves its todos to inbox.
- **Areas** group related projects (e.g., Work, Personal). Deleting an area unlinks its projects.

## Storage

tada uses a `.tada/` directory per project (like `.git/`):

```
.tada/
  store.json       # All todos, projects, areas
  store.undo.json  # Previous state (for undo, auto-managed)
```

### Local vs Global

- **Local** (default): `.tada/` in the current directory or nearest parent. Created with `tada init`.
- **Global**: `~/.tada/` in your home directory. Used with `tada -g` or the `g` key in the TUI.

### Registry

All known local stores are tracked in `~/.tada/registry.json`. This lets `tada stores` list every tada directory across your system. Stores are registered automatically when opened or created.

## Development

```bash
git clone https://github.com/taichatha/tada.git
cd tada
npm install
npm run build
npm link          # Makes `tada` available globally

npm test          # Run tests
npm run lint      # Type-check
npm run dev -- ls # Run CLI without building
```

## Architecture

```
src/
  core/   # Pure business logic (no I/O awareness)
  cli/    # Commander.js CLI layer
  tui/    # Ink/React terminal UI
  mcp/    # MCP server (stdio transport)
  test/   # Vitest tests
```

The **core** layer is the foundation. All functions take a `TadaStore` object, mutate it in memory, and return results. The CLI, TUI, and MCP layers handle loading/saving and user interaction.
