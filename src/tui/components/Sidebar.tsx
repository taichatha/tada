import React from "react";
import { Box, Text } from "ink";
import type { View, FocusZone } from "../hooks/useNavigation.js";
import type { TadaStore } from "../../core/types.js";
import type { StoreMode } from "../../core/store.js";
import { getInbox, getToday, getUpcoming } from "../../core/views.js";
import { colors, icons, SIDEBAR_WIDTH } from "../theme.js";
import { Marquee } from "./Marquee.js";

interface SidebarProps {
  view: View;
  focus: FocusZone;
  sidebarCursor: number;
  data: TadaStore;
  storePath: string | null;
  storeMode: StoreMode;
}

const views: { key: View; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "projects", label: "Projects" },
  { key: "areas", label: "Areas" },
  { key: "logbook", label: "Logbook" },
  { key: "search", label: "Search" },
];

function getCount(key: View, data: TadaStore): number | null {
  switch (key) {
    case "inbox": return getInbox(data).length;
    case "today": return getToday(data).length;
    case "upcoming": return getUpcoming(data).length;
    case "projects": return data.projects.filter((p) => p.status === "active").length;
    case "areas": return data.areas.length;
    case "logbook": return data.todos.filter((t) => t.status === "completed" || t.status === "cancelled").length;
    default: return null;
  }
}

export function Sidebar({ view, focus, sidebarCursor, data, storePath, storeMode }: SidebarProps) {
  const isFocused = focus === "sidebar";

  return (
    <Box
      flexDirection="column"
      width={SIDEBAR_WIDTH}
      borderStyle="single"
      borderColor={isFocused ? colors.accent : colors.border}
      paddingX={1}
    >
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={colors.accent}>tada</Text>
        {storePath && (
          <Marquee
            text={`${storePath} (${storeMode})`}
            width={SIDEBAR_WIDTH - 4}
            active={isFocused}
            color={colors.fgDim}
          />
        )}
      </Box>
      {views.map((v, i) => {
        const isActive = view === v.key;
        const isCursor = isFocused && sidebarCursor === i;
        const count = getCount(v.key, data);

        return (
          <Box key={v.key}>
            <Text color={isCursor ? colors.accent : undefined}>
              {isCursor ? icons.cursor + " " : "  "}
            </Text>
            <Text color={colors.fgMuted}>{i + 1} </Text>
            <Text
              bold={isActive}
              color={isActive ? colors.accent : colors.fg}
              inverse={isCursor}
            >
              {v.label}
            </Text>
            {count !== null && count > 0 && (
              <Text color={colors.fgDim}> ({count})</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
