import React, { useState } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { colors } from "../theme.js";

interface ProjectAddProps {
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function ProjectAdd({ onSubmit, onCancel }: ProjectAddProps) {
  const [value, setValue] = useState("");

  return (
    <Box borderStyle="single" borderColor={colors.accent} paddingX={1}>
      <Text color={colors.accent}>+ </Text>
      <Text color={colors.fgDim}>New project: </Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={(v) => {
          const trimmed = v.trim();
          if (!trimmed) {
            onCancel();
            return;
          }
          onSubmit(trimmed);
        }}
      />
    </Box>
  );
}
