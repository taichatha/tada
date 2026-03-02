import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Store } from "../../core/store.js";
import {
  getInbox,
  getToday,
  getUpcoming,
  search,
} from "../../core/views.js";

export function registerViewTools(server: McpServer) {
  const sortParam = z
    .enum(["created", "alpha", "due"])
    .optional()
    .describe("Sort order: created (default), alpha, due");

  server.tool(
    "view_today",
    "Show todos scheduled for today or with deadlines today/overdue",
    { sort: sortParam },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getToday(data, input.sort ?? "created");
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
    "view_upcoming",
    "Show todos scheduled for future dates",
    { sort: sortParam },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getUpcoming(data, input.sort ?? "created");
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
    "view_inbox",
    "Show open todos not assigned to any project",
    { sort: sortParam },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const todos = getInbox(data, input.sort ?? "created");
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
    "search",
    "Search todos and projects by text. Searches titles, notes, and tags.",
    {
      query: z.string().describe("Search text"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const results = search(data, input.query);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
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
