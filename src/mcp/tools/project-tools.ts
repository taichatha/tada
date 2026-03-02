import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Store } from "../../core/store.js";
import {
  createProject,
  updateProject,
  completeProject,
  deleteProject,
  getProject,
  listProjects,
} from "../../core/project.js";
import { getProjectTodos } from "../../core/views.js";

export function registerProjectTools(server: McpServer) {
  server.tool(
    "project_create",
    "Create a new project",
    {
      title: z.string().describe("Project title"),
      notes: z.string().optional().describe("Project notes"),
      areaId: z.string().optional().describe("Area ID to assign to"),
      tags: z.array(z.string()).optional().describe("Tags"),
      deadline: z.string().optional().describe("Deadline (YYYY-MM-DD)"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const project = createProject(data, input);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
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
    "project_list",
    "List all projects with todo counts",
    {
      status: z
        .enum(["active", "completed", "on_hold", "all"])
        .optional()
        .describe("Filter by status (default: active)"),
      areaId: z.string().optional().describe("Filter by area ID"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const filter: any = {};
        if (input.status && input.status !== "all") filter.status = input.status;
        if (input.areaId) filter.areaId = input.areaId;
        const projects = listProjects(
          data,
          Object.keys(filter).length > 0 ? filter : undefined,
        );
        const result = projects.map((p) => ({
          ...p,
          todoCount: getProjectTodos(data, p.id).length,
        }));
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
    "project_show",
    "Show project details with its todos",
    {
      id: z.string().describe("Project ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const project = getProject(data, input.id);
        if (!project) {
          return {
            content: [
              {
                type: "text",
                text: `No project found with ID prefix "${input.id}"`,
              },
            ],
            isError: true,
          };
        }
        const todos = getProjectTodos(data, project.id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...project, todos }, null, 2),
            },
          ],
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
    "project_complete",
    "Mark a project as completed",
    {
      id: z.string().describe("Project ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const project = completeProject(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(project, null, 2) }],
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
    "project_delete",
    "Delete a project (orphans its todos to inbox)",
    {
      id: z.string().describe("Project ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteProject(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: "Project deleted. Todos moved to inbox." }],
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
