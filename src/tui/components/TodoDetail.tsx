import React from "react";
import { Box, Text } from "ink";
import type { Todo, TadaStore } from "../../core/types.js";
import { colors, icons, priorityMarkers } from "../theme.js";

interface TodoDetailProps {
  todo: Todo;
  data: TadaStore;
  subtasks?: Todo[];
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Box width={14}>
        <Text color={colors.fgDim}>{label}</Text>
      </Box>
      {children}
    </Box>
  );
}

export function TodoDetail({ todo, data, subtasks = [] }: TodoDetailProps) {
  const project = todo.projectId
    ? data.projects.find((p) => p.id === todo.projectId)
    : null;
  const area = todo.areaId
    ? data.areas.find((a) => a.id === todo.areaId)
    : null;

  const statusIcon = todo.status === "completed" ? icons.completed
    : todo.status === "cancelled" ? icons.cancelled
    : icons.open;
  const statusColor = todo.status === "completed" ? colors.success : colors.fgDim;

  const priorityColor = todo.priority === "high" ? colors.priorityHigh
    : todo.priority === "medium" ? colors.priorityMedium
    : todo.priority === "low" ? colors.priorityLow
    : undefined;

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={colors.accent}
      paddingX={2}
      paddingY={1}
    >
      <Box marginBottom={1}>
        <Text color={statusColor}>{statusIcon} </Text>
        <Text bold color={colors.fg}>{todo.title}</Text>
        <Text color={colors.fgMuted}> {todo.id.slice(0, 6)}</Text>
      </Box>

      <Row label="Status">
        <Text color={statusColor}>{todo.status}</Text>
      </Row>

      {todo.priority !== "none" && (
        <Row label="Priority">
          <Text color={priorityColor}>{priorityMarkers[todo.priority]} {todo.priority}</Text>
        </Row>
      )}

      {todo.tags.length > 0 && (
        <Row label="Tags">
          <Text color={colors.tag}>{todo.tags.map((t) => `#${t}`).join(" ")}</Text>
        </Row>
      )}

      {project && (
        <Row label="Project">
          <Text>{project.title}</Text>
        </Row>
      )}

      {area && (
        <Row label="Area">
          <Text>{area.title}</Text>
        </Row>
      )}

      {todo.scheduledDate && (
        <Row label="Scheduled">
          <Text>{todo.scheduledDate}</Text>
        </Row>
      )}

      {todo.deadline && (
        <Row label="Deadline">
          <Text color={todo.deadline < new Date().toISOString().slice(0, 10) ? colors.danger : undefined}>
            {todo.deadline}
          </Text>
        </Row>
      )}

      {todo.recurrence && (
        <Row label="Recurrence">
          <Text>
            {todo.recurrence.interval === 1
              ? todo.recurrence.frequency
              : `every ${todo.recurrence.interval} ${todo.recurrence.frequency}`}
          </Text>
        </Row>
      )}

      {todo.notes ? (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>Notes</Text>
          <Text>{todo.notes}</Text>
        </Box>
      ) : null}

      {subtasks.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={colors.fgDim}>
            Subtasks ({subtasks.filter((s) => s.status !== "open").length}/{subtasks.length} done)
          </Text>
          {subtasks.map((sub) => (
            <Box key={sub.id}>
              <Text color={sub.status === "completed" ? colors.success : colors.fgDim}>
                {sub.status === "completed" ? icons.completed : icons.open}{" "}
              </Text>
              <Text
                color={sub.status === "completed" ? colors.fgDim : colors.fg}
                strikethrough={sub.status === "completed"}
              >
                {sub.title}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {todo.completedAt && (
        <Box marginTop={1}>
          <Row label="Completed">
            <Text color={colors.fgDim}>{todo.completedAt.slice(0, 10)}</Text>
          </Row>
        </Box>
      )}

      <Box marginTop={1}>
        <Row label="Created">
          <Text color={colors.fgDim}>{todo.createdAt.slice(0, 10)}</Text>
        </Row>
      </Box>

      <Box marginTop={1}>
        <Text color={colors.fgDim}>Esc to close  d:done  x:delete  e:edit</Text>
      </Box>
    </Box>
  );
}
