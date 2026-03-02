import React from "react";
import { Box, Text } from "ink";
import type { Todo, Project } from "../../core/types.js";
import { colors, icons, priorityMarkers } from "../theme.js";

interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  project?: Project;
  subtaskProgress?: { done: number; total: number };
  expandIndicator?: string;
  indent?: number;
}

export function TodoItem({ todo, isSelected, project, subtaskProgress, expandIndicator, indent = 0 }: TodoItemProps) {
  const statusIcon = todo.status === "completed"
    ? icons.completed
    : todo.status === "cancelled"
      ? icons.cancelled
      : icons.open;

  const statusColor = todo.status === "completed"
    ? colors.success
    : todo.status === "cancelled"
      ? colors.fgDim
      : colors.fgDim;

  const priority = priorityMarkers[todo.priority];
  const priorityColor = todo.priority === "high"
    ? colors.priorityHigh
    : todo.priority === "medium"
      ? colors.priorityMedium
      : todo.priority === "low"
        ? colors.priorityLow
        : undefined;

  const isOverdue = todo.deadline && todo.deadline < new Date().toISOString().slice(0, 10);

  return (
    <Box>
      <Text color={isSelected ? colors.accent : colors.fgDim}>
        {" ".repeat(indent)}{isSelected ? icons.cursor + " " : "  "}
      </Text>
      {expandIndicator && <Text color={colors.fgDim}>{expandIndicator} </Text>}
      <Text color={statusColor}>{statusIcon} </Text>
      {priority ? <Text color={priorityColor}>{priority} </Text> : null}
      <Text
        bold={todo.status === "open"}
        color={todo.status === "completed" ? colors.fgDim : colors.fg}
        strikethrough={todo.status === "completed"}
      >
        {todo.title}
      </Text>
      {subtaskProgress && subtaskProgress.total > 0 && (
        <Text color={colors.fgDim}> [{subtaskProgress.done}/{subtaskProgress.total}]</Text>
      )}
      {todo.tags.map((tag) => (
        <Text key={tag} color={colors.tag}> #{tag}</Text>
      ))}
      {project && (
        <Text color={colors.fgDim}> {icons.bullet} {project.title}</Text>
      )}
      {todo.deadline && (
        <Text color={isOverdue ? colors.danger : colors.fgDim}> {todo.deadline}</Text>
      )}
      {todo.scheduledDate && (
        <Text color={colors.fgDim}> @{todo.scheduledDate}</Text>
      )}
      <Text color={colors.fgMuted}> {todo.id.slice(0, 4)}</Text>
    </Box>
  );
}
