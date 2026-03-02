import React from "react";
import { Box, Text } from "ink";
import type { Project } from "../../core/types.js";
import { colors, icons } from "../theme.js";

interface ProjectPickerProps {
  projects: Project[];
  cursor: number;
  todoTitle: string;
}

export function ProjectPicker({ projects, cursor, todoTitle }: ProjectPickerProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={colors.accent}
      paddingX={1}
    >
      <Box marginBottom={1}>
        <Text color={colors.fgDim}>Move </Text>
        <Text bold>"{todoTitle}"</Text>
        <Text color={colors.fgDim}> to project:</Text>
      </Box>
      <Box>
        <Text color={cursor === 0 ? colors.accent : colors.fgDim}>
          {cursor === 0 ? icons.cursor + " " : "  "}
        </Text>
        <Text color={cursor === 0 ? colors.accent : colors.fgDim} italic>
          (none — move to inbox)
        </Text>
      </Box>
      {projects.map((p, i) => {
        const idx = i + 1;
        const isSelected = cursor === idx;
        return (
          <Box key={p.id}>
            <Text color={isSelected ? colors.accent : colors.fgDim}>
              {isSelected ? icons.cursor + " " : "  "}
            </Text>
            <Text bold={isSelected} color={isSelected ? colors.accent : colors.fg}>
              {p.title}
            </Text>
          </Box>
        );
      })}
      <Box marginTop={1}>
        <Text color={colors.fgDim}>j/k:navigate  Enter:select  Esc:cancel</Text>
      </Box>
    </Box>
  );
}
