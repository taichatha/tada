import React from "react";
import { Box, Text } from "ink";
import { colors } from "../theme.js";

interface ConfirmDialogProps {
  message: string;
}

export function ConfirmDialog({ message }: ConfirmDialogProps) {
  return (
    <Box borderStyle="single" borderColor={colors.warning} paddingX={1}>
      <Text color={colors.warning}>{message}</Text>
      <Text color={colors.fgDim}>  (y/n)</Text>
    </Box>
  );
}
