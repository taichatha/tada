import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Store } from "../../core/store.js";
import {
  createArea,
  updateArea,
  deleteArea,
  listAreas,
} from "../../core/area.js";
import { listProjects } from "../../core/project.js";

export function registerAreaTools(server: McpServer) {
  server.tool(
    "area_create",
    "Create a new area (e.g., Work, Personal)",
    {
      title: z.string().describe("Area title"),
      notes: z.string().optional().describe("Area notes"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        const area = createArea(data, input);
        await store.saveWithBackup(data);
        return {
          content: [{ type: "text", text: JSON.stringify(area, null, 2) }],
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
    "area_list",
    "List all areas with project counts",
    {},
    async () => {
      try {
        const store = new Store();
        const data = await store.load();
        const areas = listAreas(data);
        const result = areas.map((a) => ({
          ...a,
          projectCount: listProjects(data, { areaId: a.id }).length,
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
    "area_delete",
    "Delete an area (nullifies areaId on its projects)",
    {
      id: z.string().describe("Area ID or unambiguous prefix"),
    },
    async (input) => {
      try {
        const store = new Store();
        const data = await store.load();
        deleteArea(data, input.id);
        await store.saveWithBackup(data);
        return {
          content: [
            { type: "text", text: "Area deleted. Projects unassigned from area." },
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
}
