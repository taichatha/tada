import React from "react";
import { Box, Text } from "ink";
import { colors } from "../theme.js";

const sections = [
  {
    title: "Navigation",
    keys: [
      ["j/k", "Move up/down"],
      ["h/l", "Switch sidebar/main"],
      ["1-6", "Jump to view"],
      ["Tab", "Toggle sidebar/main"],
      ["Enter", "Open detail / expand project"],
      ["Esc", "Close overlay / back"],
    ],
  },
  {
    title: "Actions",
    keys: [
      ["a", "Add todo (context-aware)"],
      ["A", "Add subtask under selected"],
      ["d", "Mark done"],
      ["x", "Delete"],
      ["m", "Move to project"],
      ["p", "Create project"],
      ["u", "Undo last action"],
      ["/", "Search"],
    ],
  },
  {
    title: "View",
    keys: [
      ["s", "Cycle sort (created/alpha/due)"],
      ["c", "Toggle completed"],
      ["g", "Toggle global/local store"],
      ["?", "This help"],
      ["q", "Quit"],
    ],
  },
  {
    title: "Quick Add Syntax",
    keys: [
      ["#tag", "Add tag"],
      ["!high / !!!", "Set priority"],
      ["@today", "Schedule for today"],
      ["@2026-03-01", "Schedule for date"],
      ["due:2026-03-01", "Set deadline"],
      ["p:name", "Assign to project"],
    ],
  },
];

export function HelpDialog() {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={colors.accent}
      paddingX={2}
      paddingY={1}
    >
      <Box marginBottom={1}>
        <Text bold color={colors.accent}>Keybindings</Text>
        <Text color={colors.fgDim}>  (press Esc to close)</Text>
      </Box>
      {sections.map((section) => (
        <Box key={section.title} flexDirection="column" marginBottom={1}>
          <Text bold color={colors.fg}>{section.title}</Text>
          {section.keys.map(([key, desc]) => (
            <Box key={key}>
              <Box width={20}>
                <Text bold color={colors.accent}>  {key}</Text>
              </Box>
              <Text color={colors.fgDim}>{desc}</Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}
