import React from "react";
import { Box, Text } from "ink";
import type { Todo, TadaStore } from "../../core/types.js";
import { TodoItem } from "./TodoItem.js";
import { colors } from "../theme.js";

interface LogbookViewProps {
  data: TadaStore;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
}

export function getLogbookItems(data: TadaStore): Todo[] {
  return data.todos
    .filter((t) => t.status === "completed" || t.status === "cancelled")
    .sort((a, b) => {
      const aDate = a.completedAt ?? a.updatedAt;
      const bDate = b.completedAt ?? b.updatedAt;
      return bDate.localeCompare(aDate);
    });
}

export function LogbookView({ data, cursor, scrollOffset, viewportHeight }: LogbookViewProps) {
  const items = getLogbookItems(data);
  const visible = items.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.fg}>Logbook</Text>
        <Text color={colors.fgDim}> ({items.length})</Text>
      </Box>
      {items.length === 0 ? (
        <Text color={colors.fgDim}>No completed items yet</Text>
      ) : (
        visible.map((todo, i) => {
          const actualIdx = scrollOffset + i;
          const project = todo.projectId
            ? data.projects.find((p) => p.id === todo.projectId)
            : undefined;
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              isSelected={actualIdx === cursor}
              project={project}
            />
          );
        })
      )}
      {items.length > viewportHeight && (
        <Box marginTop={1}>
          <Text color={colors.fgMuted}>
            {scrollOffset + 1}-{Math.min(scrollOffset + viewportHeight, items.length)} of {items.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}
