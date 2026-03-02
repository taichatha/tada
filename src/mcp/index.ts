import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTodoTools } from "./tools/todo-tools.js";
import { registerProjectTools } from "./tools/project-tools.js";
import { registerAreaTools } from "./tools/area-tools.js";
import { registerViewTools } from "./tools/view-tools.js";

export async function startMcpServer() {
  const server = new McpServer({
    name: "tada",
    version: "0.1.0",
  });

  registerTodoTools(server);
  registerProjectTools(server);
  registerAreaTools(server);
  registerViewTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// When run directly (not imported)
const isDirectRun =
  process.argv[1]?.endsWith("mcp/index.ts") ||
  process.argv[1]?.endsWith("mcp/index.js");
if (isDirectRun) {
  startMcpServer();
}
