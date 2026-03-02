import React from "react";
import { Box, Text } from "ink";
import type { TadaStore } from "../../core/types.js";
import { colors, icons } from "../theme.js";

interface AreaListProps {
  data: TadaStore;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
}

export function AreaList({ data, cursor, scrollOffset, viewportHeight }: AreaListProps) {
  const areas = data.areas;
  const visible = areas.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.fg}>Areas</Text>
        <Text color={colors.fgDim}> ({areas.length})</Text>
      </Box>
      {areas.length === 0 ? (
        <Text color={colors.fgDim}>No areas</Text>
      ) : (
        visible.map((area, i) => {
          const actualIdx = scrollOffset + i;
          const isSelected = actualIdx === cursor;
          const projectCount = data.projects.filter(
            (p) => p.areaId === area.id && p.status === "active",
          ).length;

          return (
            <Box key={area.id}>
              <Text color={isSelected ? colors.accent : colors.fgDim}>
                {isSelected ? icons.cursor + " " : "  "}
              </Text>
              <Text color={colors.fgDim}>{icons.bullet} </Text>
              <Text bold={isSelected} color={isSelected ? colors.accent : colors.fg}>
                {area.title}
              </Text>
              <Text color={colors.fgDim}> ({projectCount} projects)</Text>
              <Text color={colors.fgMuted}> {area.id.slice(0, 4)}</Text>
            </Box>
          );
        })
      )}
    </Box>
  );
}
