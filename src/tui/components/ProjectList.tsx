import React from "react";
import { Box, Text } from "ink";
import type { TadaStore, Project, Todo } from "../../core/types.js";
import { getProjectTodos } from "../../core/views.js";
import type { SortMode } from "../../core/views.js";
import { TodoItem } from "./TodoItem.js";
import { colors, icons } from "../theme.js";

interface ProjectListProps {
  data: TadaStore;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
  expandedProjectId: string | null;
  showCompleted: boolean;
  sortMode: SortMode;
}

interface ProjectRow {
  type: "project";
  project: Project;
  todoCount: number;
}

interface TodoRow {
  type: "todo";
  todo: Todo;
  project: Project;
}

export type ProjectListRow = ProjectRow | TodoRow;

export function getProjectRows(data: TadaStore, expandedProjectId: string | null, showCompleted = false, sort: SortMode = "created"): ProjectListRow[] {
  const rows: ProjectListRow[] = [];
  const activeProjects = data.projects.filter((p) => p.status === "active");

  for (const project of activeProjects) {
    const openTodos = getProjectTodos(data, project.id, sort);
    rows.push({ type: "project", project, todoCount: openTodos.length });

    if (expandedProjectId === project.id) {
      for (const todo of openTodos) {
        rows.push({ type: "todo", todo, project });
      }
      if (showCompleted) {
        const doneTodos = data.todos.filter(
          (t) => t.projectId === project.id && !t.parentId && (t.status === "completed" || t.status === "cancelled"),
        );
        for (const todo of doneTodos) {
          rows.push({ type: "todo", todo, project });
        }
      }
    }
  }

  return rows;
}

export function ProjectList({ data, cursor, scrollOffset, viewportHeight, expandedProjectId, showCompleted, sortMode }: ProjectListProps) {
  const rows = getProjectRows(data, expandedProjectId, showCompleted, sortMode);
  const visible = rows.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.fg}>Projects</Text>
        <Text color={colors.fgDim}> ({data.projects.filter((p) => p.status === "active").length})</Text>
      </Box>
      {rows.length === 0 ? (
        <Text color={colors.fgDim}>No projects</Text>
      ) : (
        visible.map((row, i) => {
          const actualIdx = scrollOffset + i;
          const isSelected = actualIdx === cursor;

          if (row.type === "project") {
            const isExpanded = expandedProjectId === row.project.id;
            return (
              <Box key={row.project.id}>
                <Text color={isSelected ? colors.accent : colors.fgDim}>
                  {isSelected ? icons.cursor + " " : "  "}
                </Text>
                <Text color={colors.fgDim}>
                  {isExpanded ? icons.expanded : icons.collapsed}{" "}
                </Text>
                <Text bold color={isSelected ? colors.accent : colors.fg}>
                  {row.project.title}
                </Text>
                <Text color={colors.fgDim}> ({row.todoCount})</Text>
                <Text color={colors.fgMuted}> {row.project.id.slice(0, 4)}</Text>
              </Box>
            );
          }

          const subs = data.todos.filter((t) => t.parentId === row.todo.id);
          const subtaskProgress = subs.length > 0
            ? { done: subs.filter((s) => s.status !== "open").length, total: subs.length }
            : undefined;
          return (
            <Box key={row.todo.id} marginLeft={2}>
              <TodoItem
                todo={row.todo}
                isSelected={isSelected}
                subtaskProgress={subtaskProgress}
              />
            </Box>
          );
        })
      )}
    </Box>
  );
}
