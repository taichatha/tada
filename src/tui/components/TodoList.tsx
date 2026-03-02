import React from "react";
import { Box, Text } from "ink";
import type { Todo, TadaStore } from "../../core/types.js";
import { TodoItem } from "./TodoItem.js";
import { colors, icons } from "../theme.js";

interface TodoListProps {
  todos: Todo[];
  title: string;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
  data: TadaStore;
  expandedTodoId?: string | null;
}

export function TodoList({ todos, title, cursor, scrollOffset, viewportHeight, data, expandedTodoId }: TodoListProps) {
  const visible = todos.slice(scrollOffset, scrollOffset + viewportHeight);
  const topLevelCount = todos.filter((t) => !t.parentId).length;

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.fg}>{title}</Text>
        <Text color={colors.fgDim}> ({topLevelCount})</Text>
      </Box>
      {todos.length === 0 ? (
        <Text color={colors.fgDim}>No items</Text>
      ) : (
        visible.map((todo, i) => {
          const actualIdx = scrollOffset + i;
          const isSubtask = !!todo.parentId;
          const project = todo.projectId
            ? data.projects.find((p) => p.id === todo.projectId)
            : undefined;
          const subs = data.todos.filter((t) => t.parentId === todo.id);
          const isExpanded = expandedTodoId === todo.id;
          const subtaskProgress = subs.length > 0 && !isExpanded
            ? { done: subs.filter((s) => s.status !== "open").length, total: subs.length }
            : undefined;
          const expandIndicator = subs.length > 0
            ? (isExpanded ? icons.expanded : icons.collapsed)
            : undefined;
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              isSelected={actualIdx === cursor}
              project={isSubtask ? undefined : project}
              subtaskProgress={subtaskProgress}
              expandIndicator={expandIndicator}
              indent={isSubtask ? 3 : 0}
            />
          );
        })
      )}
      {todos.length > viewportHeight && (
        <Box marginTop={1}>
          <Text color={colors.fgMuted}>
            {scrollOffset + 1}-{Math.min(scrollOffset + viewportHeight, todos.length)} of {todos.length}
          </Text>
        </Box>
      )}
    </Box>
  );
}
