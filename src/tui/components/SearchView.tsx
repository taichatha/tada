import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type { TadaStore, Todo, Project } from "../../core/types.js";
import { search } from "../../core/views.js";
import { TodoItem } from "./TodoItem.js";
import { colors, icons } from "../theme.js";

interface SearchViewProps {
  data: TadaStore;
  cursor: number;
  scrollOffset: number;
  viewportHeight: number;
  isSearchInputActive: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export type SearchResult = { type: "todo"; item: Todo } | { type: "project"; item: Project };

export function getSearchResults(data: TadaStore, query: string): SearchResult[] {
  if (!query.trim()) return [];
  return search(data, query);
}

export function SearchView({
  data,
  cursor,
  scrollOffset,
  viewportHeight,
  isSearchInputActive,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: SearchViewProps) {
  const results = getSearchResults(data, searchQuery);
  const visible = results.slice(scrollOffset, scrollOffset + viewportHeight - 2);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Box marginBottom={1}>
        <Text color={colors.accent}>/ </Text>
        {isSearchInputActive ? (
          <TextInput
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />
        ) : (
          <Text color={searchQuery ? colors.fg : colors.fgDim}>
            {searchQuery || "Type / to search..."}
          </Text>
        )}
      </Box>

      {!searchQuery.trim() ? (
        <Text color={colors.fgDim}>Type to search todos and projects</Text>
      ) : results.length === 0 ? (
        <Text color={colors.fgDim}>No results for "{searchQuery}"</Text>
      ) : (
        <>
          <Text color={colors.fgDim}>{results.length} results</Text>
          <Box flexDirection="column" marginTop={1}>
            {visible.map((result, i) => {
              const actualIdx = scrollOffset + i;
              const isSelected = !isSearchInputActive && actualIdx === cursor;

              if (result.type === "todo") {
                return (
                  <TodoItem
                    key={result.item.id}
                    todo={result.item}
                    isSelected={isSelected}
                  />
                );
              }

              return (
                <Box key={result.item.id}>
                  <Text color={isSelected ? colors.accent : colors.fgDim}>
                    {isSelected ? icons.cursor + " " : "  "}
                  </Text>
                  <Text color={colors.fgDim}>{icons.bullet} </Text>
                  <Text bold color={isSelected ? colors.accent : colors.fg}>
                    {result.item.title}
                  </Text>
                  <Text color={colors.fgDim}> (project)</Text>
                  <Text color={colors.fgMuted}> {result.item.id.slice(0, 4)}</Text>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
