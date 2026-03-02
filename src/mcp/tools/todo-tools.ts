import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Store } from "../../core/store.js";
import {
  addTodo,
  completeTodo,
  reopenTodo,
  cancelTodo,
  updateTodo,
  deleteTodo,
  listTodos,
  getSubtasks,
} from "../../core/todo.js";

export function registerTodoTools(server: McpServer) {
  server.tool(
    "todo_add",
    "Create a new todo item",
    {
      title: z.string().describe("Title of the todo"),
      notes: z.string().optional().describe("Additional notes"),
      projectId: z.string().optional().describe("Project ID to assign to"),
      tags: z.array(z.string()).optional().describe("Tags to apply"),
      deadline: z.string().optional().describe("Deadline date (YYYY-MM-DD)"),
      scheduledDate: z
        .string()
        .optional()
        .describe("Scheduled date (YYYY-MM-DD)"),
      priority: z
        .enum(["none", "low", "medium", "high"])
        .optional()
        .describe("Priority level"),
      parentId: z
        .string()
        .optional()
        .describe("Parent todo ID to create as subtask (1 level only)"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = addTodo(data, {
          title: input.title,
          notes: input.notes,
          projectId: input.projectId,
          tags: input.tags,
          deadline: input.deadline,
          scheduledDate: input.scheduledDate,
          priority: input.priority,
          parentId: input.parentId,
        });
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_list",
    "List todos with optional filters. Returns open todos by default. Subtasks are excluded unless parentId is specified.",
    {
      status: z
        .enum(["open", "completed", "cancelled", "all"])
        .optional()
        .describe("Filter by status (default: open)"),
      projectId: z.string().optional().describe("Filter by project ID"),
      tag: z.string().optional().describe("Filter by tag"),
      parentId: z
        .string()
        .optional()
        .describe("List subtasks of a specific todo"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();

        if (input.parentId) {
          const subtasks = getSubtasks(data, input.parentId);
          return {
            content: [{ type: "text", text: JSON.stringify(subtasks, null, 2) }],
          };
        }

        const filter: any = {};
        if (input.status && input.status !== "all") filter.status = input.status;
        if (input.projectId) filter.projectId = input.projectId;
        if (input.tag) filter.tag = input.tag;
        const todos = listTodos(
          data,
          Object.keys(filter).length > 0 ? filter : undefined,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(todos, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_complete",
    "Mark a todo as completed. Creates next occurrence if recurring. Fails if todo has open subtasks.",
    {
      id: z.string().describe("Todo ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = completeTodo(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_update",
    "Update fields on an existing todo",
    {
      id: z.string().describe("Todo ID or unambiguous prefix"),
      title: z.string().optional(),
      notes: z.string().optional(),
      priority: z.enum(["none", "low", "medium", "high"]).optional(),
      deadline: z
        .string()
        .nullable()
        .optional()
        .describe("Deadline (YYYY-MM-DD or null to clear)"),
      scheduledDate: z
        .string()
        .nullable()
        .optional()
        .describe("Scheduled date (YYYY-MM-DD or null to clear)"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Replace all tags"),
      projectId: z
        .string()
        .nullable()
        .optional()
        .describe("Move to project (ID or null for inbox)"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const { id, ...updates } = input;
        const todo = updateTodo(data, id, updates);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_delete",
    "Permanently delete a todo. Cascade deletes subtasks if any.",
    {
      id: z.string().describe("Todo ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteTodo(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: "Deleted successfully." }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_reopen",
    "Reopen a completed or cancelled todo (undo complete/cancel)",
    {
      id: z.string().describe("Todo ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = reopenTodo(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "todo_cancel",
    "Cancel a todo (mark as cancelled without deleting)",
    {
      id: z.string().describe("Todo ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todo = cancelTodo(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "undo",
    "Undo the last mutation (add, complete, delete, move, etc.)",
    {},
    async () => {
      try {
        const store = new Store();
        await store.undo();
        return {
          content: [{ type: "text", text: "Undone successfully" }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        };
      }
    },
  );
}
