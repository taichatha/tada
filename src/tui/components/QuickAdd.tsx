import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { colors } from "../theme.js";

interface QuickAddProps {
  onSubmit: (parsed: ParsedInput) => void;
  onCancel: () => void;
  contextProject?: string | null;
  contextSubtask?: string | null;
}

export interface ParsedInput {
  title: string;
  tags: string[];
  priority: "none" | "low" | "medium" | "high";
  scheduledDate: string | null;
  deadline: string | null;
  projectName: string | null;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseQuickAdd(input: string): ParsedInput {
  const tags: string[] = [];
  let priority: ParsedInput["priority"] = "none";
  let scheduledDate: string | null = null;
  let deadline: string | null = null;
  let projectName: string | null = null;

  const parts = input.split(/\s+/);
  const titleParts: string[] = [];

  for (const part of parts) {
    if (part.startsWith("#") && part.length > 1) {
      tags.push(part.slice(1));
    } else if (part === "!high" || part === "!!!") {
      priority = "high";
    } else if (part === "!medium" || part === "!!") {
      priority = "medium";
    } else if (part === "!low" || part === "!") {
      priority = "low";
    } else if (part === "@today") {
      scheduledDate = today();
    } else if (part === "@tomorrow") {
      scheduledDate = tomorrow();
    } else if (part.startsWith("@") && /^\d{4}-\d{2}-\d{2}$/.test(part.slice(1))) {
      scheduledDate = part.slice(1);
    } else if (part.startsWith("due:") && /^\d{4}-\d{2}-\d{2}$/.test(part.slice(4))) {
      deadline = part.slice(4);
    } else if (part.startsWith("p:") && part.length > 2) {
      projectName = part.slice(2);
    } else {
      titleParts.push(part);
    }
  }

  return {
    title: titleParts.join(" "),
    tags,
    priority,
    scheduledDate,
    deadline,
    projectName,
  };
}

export function QuickAdd({ onSubmit, onCancel, contextProject, contextSubtask }: QuickAddProps) {
  const [value, setValue] = useState("");

  return (
    <Box borderStyle="single" borderColor={colors.accent} paddingX={1}>
      <Text color={colors.accent}>{contextSubtask ? "↳ " : "+ "}</Text>
      {contextSubtask && (
        <Text color={colors.fgDim}>[subtask of {contextSubtask}] </Text>
      )}
      {!contextSubtask && contextProject && (
        <Text color={colors.fgDim}>[{contextProject}] </Text>
      )}
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={(v) => {
          const trimmed = v.trim();
          if (!trimmed) {
            onCancel();
            return;
          }
          onSubmit(parseQuickAdd(trimmed));
        }}
      />
    </Box>
  );
}
