import React from "react";
import { Box, Text } from "ink";
import type { View } from "../hooks/useNavigation.js";
import { colors } from "../theme.js";

import type { StoreMode } from "../../core/store.js";

interface StatusBarProps {
  view: View;
  inputMode: string | null;
  message: string | null;
  showCompleted: boolean;
  storeMode: StoreMode;
}

function Shortcut({ hotkey, label }: { hotkey: string; label: string }) {
  return (
    <Box marginRight={1}>
      <Text color={colors.fgDim}>{hotkey}:{label}</Text>
    </Box>
  );
}

export function StatusBar({ view, inputMode, message, showCompleted, storeMode }: StatusBarProps) {
  if (message) {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Text color={colors.success}>{message}</Text>
      </Box>
    );
  }

  if (inputMode === "quickadd") {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Shortcut hotkey="Enter" label="add" />
        <Shortcut hotkey="Esc" label="cancel" />
        <Text color={colors.fgMuted}> #tag !high @today due:date</Text>
      </Box>
    );
  }

  if (inputMode === "confirm") {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Shortcut hotkey="y" label="confirm" />
        <Shortcut hotkey="n" label="cancel" />
      </Box>
    );
  }

  if (inputMode === "search") {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Shortcut hotkey="Enter" label="select" />
        <Shortcut hotkey="Esc" label="back" />
      </Box>
    );
  }

  if (inputMode === "move") {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Shortcut hotkey="j/k" label="pick" />
        <Shortcut hotkey="Enter" label="move" />
        <Shortcut hotkey="Esc" label="cancel" />
      </Box>
    );
  }

  if (inputMode === "detail") {
    return (
      <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
        <Shortcut hotkey="d" label="done" />
        <Shortcut hotkey="x" label="delete" />
        <Shortcut hotkey="m" label="move" />
        <Shortcut hotkey="Esc" label="close" />
      </Box>
    );
  }

  return (
    <Box borderStyle="single" borderColor={colors.border} paddingX={1}>
      <Shortcut hotkey="hjkl" label="nav" />
      <Shortcut hotkey="a" label="add" />
      <Shortcut hotkey="d" label="done" />
      <Shortcut hotkey="x" label="del" />
      <Shortcut hotkey="m" label="move" />
      <Shortcut hotkey="s" label="sort" />
      <Shortcut hotkey="c" label={showCompleted ? "hide" : "show"} />
      <Shortcut hotkey="u" label="undo" />
      <Shortcut hotkey="/" label="find" />
      <Shortcut hotkey="?" label="help" />
      <Shortcut hotkey="q" label="quit" />
    </Box>
  );
}
