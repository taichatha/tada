import React from "react";
import { Box } from "ink";
import { format, subDays } from "date-fns";
import type { View } from "../hooks/useNavigation.js";
import type { TadaStore } from "../../core/types.js";
import { getInbox, getToday, getUpcoming } from "../../core/views.js";
import type { SortMode } from "../../core/views.js";
import type { Todo } from "../../core/types.js";
import { TodoList } from "./TodoList.js";
import { ProjectList } from "./ProjectList.js";
import { AreaList } from "./AreaList.js";
import { LogbookView } from "./LogbookView.js";
import { SearchView, getSearchResults } from "./SearchView.js";
import { colors } from "../theme.js";

interface MainPanelProps {
  view: View;
  data: TadaStore;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
  isFocused: boolean;
  expandedProjectId: string | null;
  expandedTodoId: string | null;
  showCompleted: boolean;
  sortMode: SortMode;
  isSearchInputActive: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

function getCompletedForView(view: View, data: TadaStore): Todo[] {
  const cutoff = format(subDays(new Date(), 3), "yyyy-MM-dd");
  const done = data.todos.filter((t) => {
    if (t.parentId) return false;
    if (t.status !== "completed" && t.status !== "cancelled") return false;
    const doneDate = (t.completedAt ?? t.updatedAt).slice(0, 10);
    return doneDate >= cutoff;
  });
  switch (view) {
    case "inbox":
      return done.filter((t) => t.projectId === null);
    case "today": {
      const d = new Date().toISOString().slice(0, 10);
      return done.filter((t) =>
        (t.scheduledDate && t.scheduledDate <= d) ||
        (t.deadline && t.deadline <= d) ||
        (t.completedAt && t.completedAt.slice(0, 10) === d),
      );
    }
    case "upcoming":
      return done.filter((t) => t.scheduledDate && t.scheduledDate > new Date().toISOString().slice(0, 10));
    default:
      return [];
  }
}

export function getViewItems(view: View, data: TadaStore, showCompleted = false, sort: SortMode = "created", expandedTodoId: string | null = null): Todo[] {
  let open: Todo[];
  switch (view) {
    case "inbox": open = getInbox(data, sort); break;
    case "today": open = getToday(data, sort); break;
    case "upcoming": open = getUpcoming(data, sort); break;
    default: return [];
  }
  const base = showCompleted ? [...open, ...getCompletedForView(view, data)] : open;
  if (!expandedTodoId) return base;
  // Interleave subtasks after the expanded parent
  const result: Todo[] = [];
  for (const todo of base) {
    result.push(todo);
    if (todo.id === expandedTodoId) {
      const subs = data.todos.filter((t) => t.parentId === todo.id && (showCompleted || t.status === "open"));
      result.push(...subs);
    }
  }
  return result;
}

const viewTitles: Record<string, string> = {
  inbox: "Inbox",
  today: "Today",
  upcoming: "Upcoming",
};

export function MainPanel({
  view,
  data,
  cursor,
  scrollOffset,
  viewportHeight,
  isFocused,
  expandedProjectId,
  expandedTodoId,
  showCompleted,
  sortMode,
  isSearchInputActive,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: MainPanelProps) {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={isFocused ? colors.accent : colors.border}
      paddingX={1}
    >
      {(view === "inbox" || view === "today" || view === "upcoming") && (
        <TodoList
          todos={getViewItems(view, data, showCompleted, sortMode, expandedTodoId)}
          title={viewTitles[view]}
          cursor={cursor}
          scrollOffset={scrollOffset}
          viewportHeight={viewportHeight}
          data={data}
          expandedTodoId={expandedTodoId}
        />
      )}
      {view === "projects" && (
        <ProjectList
          data={data}
          cursor={cursor}
          scrollOffset={scrollOffset}
          viewportHeight={viewportHeight}
          expandedProjectId={expandedProjectId}
          showCompleted={showCompleted}
          sortMode={sortMode}
        />
      )}
      {view === "areas" && (
        <AreaList
          data={data}
          cursor={cursor}
          scrollOffset={scrollOffset}
          viewportHeight={viewportHeight}
        />
      )}
      {view === "logbook" && (
        <LogbookView
          data={data}
          cursor={cursor}
          scrollOffset={scrollOffset}
          viewportHeight={viewportHeight}
        />
      )}
      {view === "search" && (
        <SearchView
          data={data}
          cursor={cursor}
          scrollOffset={scrollOffset}
          viewportHeight={viewportHeight}
          isSearchInputActive={isSearchInputActive}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
        />
      )}
    </Box>
  );
}
