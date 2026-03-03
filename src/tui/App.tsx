import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, Text, useApp, useInput, useStdout } from "ink";
import { useStore } from "./hooks/useStore.js";
import { useNavigation } from "./hooks/useNavigation.js";
import { useSelection } from "./hooks/useSelection.js";
import { Sidebar } from "./components/Sidebar.js";
import { MainPanel, getViewItems } from "./components/MainPanel.js";
import { StatusBar } from "./components/StatusBar.js";
import { TodoDetail } from "./components/TodoDetail.js";
import { QuickAdd } from "./components/QuickAdd.js";
import type { ParsedInput } from "./components/QuickAdd.js";
import { ConfirmDialog } from "./components/ConfirmDialog.js";
import { ProjectPicker } from "./components/ProjectPicker.js";
import { getProjectRows } from "./components/ProjectList.js";
import { getSearchResults } from "./components/SearchView.js";
import { getLogbookItems } from "./components/LogbookView.js";
import { addTodo, completeTodo, reopenTodo, deleteTodo, updateTodo, getSubtasks } from "../core/todo.js";
import { createProject } from "../core/project.js";
import type { Todo } from "../core/types.js";
import type { SortMode } from "../core/views.js";
import { format } from "date-fns";
import { colors } from "./theme.js";

import { HelpDialog } from "./components/HelpDialog.js";
import { ProjectAdd } from "./components/ProjectAdd.js";

type InputMode = null | "quickadd" | "confirm" | "search" | "detail" | "move" | "help" | "createproject";

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const termHeight = stdout?.rows ?? 24;
  const viewportHeight = Math.max(termHeight - 8, 5);

  const { data, loading, error, mutate, mode, storePath, toggleMode, undo } = useStore();
  const nav = useNavigation();
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCursor, setSidebarCursor] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("created");

  // Move-to-project state
  const [moveCursor, setMoveCursor] = useState(0);
  const [moveTodo, setMoveTodo] = useState<Todo | null>(null);

  // Subtask parent for Shift+A
  const subtaskParentRef = useRef<string | null>(null);

  // Confirm action stored in ref to avoid stale closure issues
  const confirmActionRef = useRef<(() => void) | null>(null);

  // Get current item count for selection
  const getItemCount = useCallback(() => {
    if (nav.view === "inbox" || nav.view === "today" || nav.view === "upcoming") {
      return getViewItems(nav.view, data, showCompleted, sortMode, expandedTodoId).length;
    }
    if (nav.view === "projects") {
      return getProjectRows(data, expandedProjectId, showCompleted, sortMode).length;
    }
    if (nav.view === "areas") {
      return data.areas.length;
    }
    if (nav.view === "logbook") {
      return getLogbookItems(data).length;
    }
    if (nav.view === "search") {
      return getSearchResults(data, searchQuery).length;
    }
    return 0;
  }, [nav.view, data, expandedProjectId, expandedTodoId, searchQuery, showCompleted, sortMode]);

  const selection = useSelection(getItemCount(), viewportHeight);

  // Reset selection and expansion when view changes
  useEffect(() => {
    selection.reset();
    setExpandedTodoId(null);
  }, [nav.view]);

  // Flash message helper
  const flash = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }, []);

  // Get the currently selected todo
  const getSelectedTodo = useCallback((): Todo | null => {
    if (nav.view === "inbox" || nav.view === "today" || nav.view === "upcoming") {
      const items = getViewItems(nav.view, data, showCompleted, sortMode, expandedTodoId);
      return items[selection.cursor] ?? null;
    }
    if (nav.view === "projects") {
      const rows = getProjectRows(data, expandedProjectId, showCompleted, sortMode);
      const row = rows[selection.cursor];
      if (row?.type === "todo") return row.todo;
      return null;
    }
    if (nav.view === "logbook") {
      const items = getLogbookItems(data);
      return items[selection.cursor] ?? null;
    }
    if (nav.view === "search") {
      const results = getSearchResults(data, searchQuery);
      const r = results[selection.cursor];
      if (r?.type === "todo") return r.item;
      return null;
    }
    return null;
  }, [nav.view, data, selection.cursor, expandedProjectId, expandedTodoId, searchQuery, showCompleted, sortMode]);

  // Get the active project context (for adding inside a project)
  const getActiveProject = useCallback(() => {
    if (nav.view === "projects" && expandedProjectId) {
      return data.projects.find((p) => p.id === expandedProjectId) ?? null;
    }
    return null;
  }, [nav.view, expandedProjectId, data]);

  // Handle quick add submit
  const handleQuickAdd = useCallback(async (parsed: ParsedInput) => {
    if (!parsed.title) {
      setInputMode(null);
      subtaskParentRef.current = null;
      return;
    }
    const activeProject = getActiveProject();
    const parentId = subtaskParentRef.current;
    await mutate((store) => {
      let projectId: string | null = null;
      // Explicit p: in input takes priority
      if (parsed.projectName) {
        const p = store.projects.find(
          (proj) => proj.title.toLowerCase() === parsed.projectName!.toLowerCase(),
        );
        if (p) projectId = p.id;
      } else if (activeProject) {
        // Auto-associate with expanded project
        projectId = activeProject.id;
      }
      // Default to today's date when adding from Today view
      let scheduledDate = parsed.scheduledDate;
      if (!scheduledDate && nav.view === "today") {
        scheduledDate = format(new Date(), "yyyy-MM-dd");
      }
      addTodo(store, {
        title: parsed.title,
        tags: parsed.tags,
        priority: parsed.priority,
        scheduledDate,
        deadline: parsed.deadline,
        projectId,
        parentId,
      });
    });
    setInputMode(null);
    const parent = parentId ? data.todos.find((t) => t.id === parentId) : null;
    subtaskParentRef.current = null;
    flash(parent ? `Added subtask to "${parent.title}"` : `Added "${parsed.title}"${getActiveProject() ? ` to ${getActiveProject()!.title}` : ""}`);
  }, [mutate, flash, getActiveProject, data]);

  // Handle complete (toggle: complete if open, reopen if completed/cancelled)
  const handleComplete = useCallback(async () => {
    const todo = getSelectedTodo();
    if (!todo) return;
    try {
      if (todo.status === "open") {
        await mutate((store) => completeTodo(store, todo.id));
        flash(`Completed "${todo.title}"`);
      } else {
        await mutate((store) => reopenTodo(store, todo.id));
        flash(`Reopened "${todo.title}"`);
      }
    } catch (err: any) {
      flash(err.message);
    }
  }, [getSelectedTodo, mutate, flash]);

  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
    const todo = getSelectedTodo();
    if (!todo) return;
    confirmActionRef.current = async () => {
      await mutate((store) => deleteTodo(store, todo.id));
      flash(`Deleted "${todo.title}"`);
      setInputMode(null);
      confirmActionRef.current = null;
    };
    setInputMode("confirm");
  }, [getSelectedTodo, mutate, flash]);

  // Handle move to project
  const handleStartMove = useCallback(() => {
    const todo = getSelectedTodo();
    if (!todo || todo.status !== "open") return;
    setMoveTodo(todo);
    setMoveCursor(0);
    setInputMode("move");
  }, [getSelectedTodo]);

  const handleConfirmMove = useCallback(async () => {
    if (!moveTodo) return;
    const activeProjects = data.projects.filter((p) => p.status === "active");
    // cursor 0 = inbox (null), cursor 1+ = project
    const targetProject = moveCursor === 0 ? null : activeProjects[moveCursor - 1] ?? null;
    const projectId = targetProject?.id ?? null;

    await mutate((store) => {
      updateTodo(store, moveTodo.id, { projectId });
    });

    const dest = targetProject ? targetProject.title : "Inbox";
    flash(`Moved "${moveTodo.title}" to ${dest}`);
    setInputMode(null);
    setMoveTodo(null);
  }, [moveTodo, moveCursor, data, mutate, flash]);

  // Handle create project
  const handleCreateProject = useCallback(async (title: string) => {
    await mutate((store) => {
      createProject(store, { title });
    });
    setInputMode(null);
    flash(`Created project "${title}"`);
  }, [mutate, flash]);

  // Keyboard handler
  useInput((input, key) => {
    // Handle confirm dialog
    if (inputMode === "confirm") {
      if (input === "y" && confirmActionRef.current) {
        confirmActionRef.current();
      } else if (input === "n" || key.escape) {
        setInputMode(null);
        confirmActionRef.current = null;
      }
      return;
    }

    // Handle move-to-project picker
    if (inputMode === "move") {
      const activeProjects = data.projects.filter((p) => p.status === "active");
      const maxIdx = activeProjects.length; // 0=inbox, 1..n=projects
      if (input === "j" || key.downArrow) {
        setMoveCursor((c) => Math.min(c + 1, maxIdx));
      } else if (input === "k" || key.upArrow) {
        setMoveCursor((c) => Math.max(c - 1, 0));
      } else if (key.return) {
        handleConfirmMove();
      } else if (key.escape) {
        setInputMode(null);
        setMoveTodo(null);
      }
      return;
    }

    // Don't handle keys during text input modes
    if (inputMode === "quickadd") {
      if (key.escape) {
        setInputMode(null);
        subtaskParentRef.current = null;
      }
      return;
    }

    if (inputMode === "search") {
      if (key.escape) {
        setInputMode(null);
      }
      return;
    }

    if (inputMode === "createproject") {
      if (key.escape) {
        setInputMode(null);
      }
      return;
    }

    // Help overlay
    if (inputMode === "help") {
      if (key.escape || input === "?") {
        setInputMode(null);
      }
      return;
    }

    // Detail modal
    if (inputMode === "detail") {
      if (key.escape) {
        setInputMode(null);
        setDetailTodo(null);
      } else if (input === "d" && detailTodo) {
        const action = detailTodo.status === "open"
          ? (store: any) => completeTodo(store, detailTodo.id)
          : (store: any) => reopenTodo(store, detailTodo.id);
        const verb = detailTodo.status === "open" ? "Completed" : "Reopened";
        mutate(action).then(() => {
          flash(`${verb} "${detailTodo.title}"`);
          setInputMode(null);
          setDetailTodo(null);
        }).catch((err: any) => {
          flash(err.message);
        });
      } else if (input === "x" && detailTodo) {
        const todo = detailTodo;
        confirmActionRef.current = async () => {
          await mutate((store) => deleteTodo(store, todo.id));
          flash(`Deleted "${todo.title}"`);
          setInputMode(null);
          setDetailTodo(null);
          confirmActionRef.current = null;
        };
        setInputMode("confirm");
      } else if (input === "m" && detailTodo && detailTodo.status === "open") {
        setMoveTodo(detailTodo);
        setMoveCursor(0);
        setInputMode("move");
        setDetailTodo(null);
      }
      return;
    }

    // Global keys
    if (input === "q") {
      exit();
      return;
    }

    if (input === "g") {
      const next = toggleMode();
      flash(`Switched to ${next}`);
      return;
    }

    if (key.tab) {
      nav.toggleFocus();
      return;
    }

    // Number keys for view switching
    const num = parseInt(input, 10);
    if (num >= 1 && num <= 7) {
      nav.jumpToView(num);
      selection.reset();
      return;
    }

    // Pane switching: h/l or left/right arrows
    if (input === "l" || key.rightArrow) {
      if (nav.focus === "sidebar") {
        nav.setFocus("main");
        return;
      }
    }
    if (input === "h" || key.leftArrow) {
      if (nav.focus === "main") {
        nav.setFocus("sidebar");
        return;
      }
    }

    // Sidebar navigation
    if (nav.focus === "sidebar") {
      if (input === "j" || key.downArrow) {
        setSidebarCursor((c) => Math.min(c + 1, 6));
      } else if (input === "k" || key.upArrow) {
        setSidebarCursor((c) => Math.max(c - 1, 0));
      } else if (key.return) {
        nav.jumpToView(sidebarCursor + 1);
        nav.setFocus("main");
        selection.reset();
      }
      return;
    }

    // Main panel keys
    if (input === "j" || key.downArrow) {
      selection.moveDown();
    } else if (input === "k" || key.upArrow) {
      selection.moveUp();
    } else if (input === "a") {
      setInputMode("quickadd");
    } else if (input === "A") {
      const todo = getSelectedTodo();
      if (todo && todo.status === "open") {
        subtaskParentRef.current = todo.id;
        setInputMode("quickadd");
      } else {
        flash("Select a todo to add a subtask");
      }
    } else if (input === "d") {
      handleComplete();
    } else if (input === "x") {
      handleDelete();
    } else if (input === "m") {
      handleStartMove();
    } else if (input === "s") {
      setSortMode((m) => {
        const next = m === "created" ? "alpha" : m === "alpha" ? "due" : "created";
        flash(`Sort: ${next}`);
        return next;
      });
    } else if (input === "c") {
      setShowCompleted((v) => !v);
      flash(showCompleted ? "Hiding completed" : "Showing completed");
    } else if (input === "u") {
      undo().then((ok) => {
        flash(ok ? "Undone" : "Nothing to undo");
      });
    } else if (input === "p") {
      setInputMode("createproject");
    } else if (input === "?") {
      setInputMode("help");
    } else if (input === "/") {
      nav.setView("search");
      nav.setFocus("main");
      setInputMode("search");
      setSearchQuery("");
      selection.reset();
    } else if (key.return) {
      // Enter: toggle expansion or show detail
      if (nav.view === "projects") {
        const rows = getProjectRows(data, expandedProjectId, false, sortMode);
        const row = rows[selection.cursor];
        if (row?.type === "project") {
          setExpandedProjectId(
            expandedProjectId === row.project.id ? null : row.project.id,
          );
        } else if (row?.type === "todo") {
          setDetailTodo(row.todo);
          setInputMode("detail");
        }
      } else {
        const todo = getSelectedTodo();
        if (todo) {
          const subs = data.todos.filter((t) => t.parentId === todo.id);
          if (subs.length > 0 && !todo.parentId) {
            setExpandedTodoId((prev) => prev === todo.id ? null : todo.id);
          } else {
            setDetailTodo(todo);
            setInputMode("detail");
          }
        }
      }
    }
  });

  if (loading) {
    return (
      <Box padding={1}>
        <Text color={colors.fgDim}>Loading...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={1}>
        <Text color={colors.danger}>{error}</Text>
      </Box>
    );
  }

  const activeProjects = data.projects.filter((p) => p.status === "active");
  const activeProject = getActiveProject();

  return (
    <Box flexDirection="column" height={termHeight}>
      {/* Main layout */}
      <Box flexGrow={1}>
        <Sidebar
          view={nav.view}
          focus={nav.focus}
          sidebarCursor={sidebarCursor}
          data={data}
          storePath={storePath}
          storeMode={mode}
        />
        <MainPanel
          view={nav.view}
          data={data}
          cursor={selection.cursor}
          scrollOffset={selection.scrollOffset}
          viewportHeight={viewportHeight}
          isFocused={nav.focus === "main"}
          expandedProjectId={expandedProjectId}
          expandedTodoId={expandedTodoId}
          showCompleted={showCompleted}
          sortMode={sortMode}
          isSearchInputActive={inputMode === "search"}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            setInputMode(null);
            selection.reset();
          }}
        />
      </Box>

      {/* Detail overlay */}
      {inputMode === "detail" && detailTodo && (
        <TodoDetail todo={detailTodo} data={data} subtasks={getSubtasks(data, detailTodo.id)} />
      )}

      {/* Quick add input */}
      {inputMode === "quickadd" && (
        <QuickAdd
          onSubmit={handleQuickAdd}
          onCancel={() => { setInputMode(null); subtaskParentRef.current = null; }}
          contextProject={activeProject?.title}
          contextSubtask={subtaskParentRef.current ? data.todos.find((t) => t.id === subtaskParentRef.current)?.title ?? null : null}
        />
      )}

      {/* Create project input */}
      {inputMode === "createproject" && (
        <ProjectAdd onSubmit={handleCreateProject} onCancel={() => setInputMode(null)} />
      )}

      {/* Move to project picker */}
      {inputMode === "move" && moveTodo && (
        <ProjectPicker
          projects={activeProjects}
          cursor={moveCursor}
          todoTitle={moveTodo.title}
        />
      )}

      {/* Help overlay */}
      {inputMode === "help" && <HelpDialog />}

      {/* Confirm dialog */}
      {inputMode === "confirm" && (
        <ConfirmDialog message="Delete this item?" />
      )}

      {/* Status bar */}
      <StatusBar
        view={nav.view}
        inputMode={inputMode}
        message={message}
        showCompleted={showCompleted}
        storeMode={mode}
      />
    </Box>
  );
}
