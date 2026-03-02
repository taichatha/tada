import { format } from "date-fns";
import type { TadaStore, Todo, Project } from "./types.js";

export type SortMode = "created" | "alpha" | "due";

function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function sortTodos(todos: Todo[], mode: SortMode): Todo[] {
  return [...todos].sort((a, b) => {
    switch (mode) {
      case "alpha":
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      case "due": {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      }
      case "created":
      default:
        return a.createdAt.localeCompare(b.createdAt);
    }
  });
}

export function getInbox(store: TadaStore, sort: SortMode = "created"): Todo[] {
  const todos = store.todos.filter(
    (t) => t.status === "open" && t.projectId === null && !t.parentId,
  );
  return sortTodos(todos, sort);
}

export function getToday(store: TadaStore, sort: SortMode = "created"): Todo[] {
  const d = today();
  const seen = new Set<string>();
  const result: Todo[] = [];

  for (const t of store.todos) {
    if (t.status !== "open") continue;
    if (t.parentId) continue;
    if (seen.has(t.id)) continue;

    const scheduled = t.scheduledDate && t.scheduledDate <= d;
    const due = t.deadline && t.deadline <= d;

    if (scheduled || due) {
      seen.add(t.id);
      result.push(t);
    }
  }

  return sortTodos(result, sort);
}

export function getUpcoming(store: TadaStore, sort?: SortMode): Todo[] {
  const d = today();
  const todos = store.todos.filter(
    (t) => t.status === "open" && !t.parentId && t.scheduledDate && t.scheduledDate > d,
  );
  if (sort && sort !== "created") {
    return sortTodos(todos, sort);
  }
  // Default: sort by scheduledDate ascending
  return [...todos].sort((a, b) => a.scheduledDate!.localeCompare(b.scheduledDate!));
}

export function getByTag(store: TadaStore, tag: string, sort: SortMode = "created"): Todo[] {
  const todos = store.todos.filter(
    (t) => t.status === "open" && !t.parentId && t.tags.includes(tag),
  );
  return sortTodos(todos, sort);
}

export function getProjectTodos(store: TadaStore, projectId: string, sort: SortMode = "created"): Todo[] {
  const todos = store.todos.filter(
    (t) => t.status === "open" && !t.parentId && t.projectId === projectId,
  );
  return sortTodos(todos, sort);
}

export function search(
  store: TadaStore,
  query: string,
): Array<{ type: "todo"; item: Todo } | { type: "project"; item: Project }> {
  const q = query.toLowerCase();
  const results: Array<
    { type: "todo"; item: Todo } | { type: "project"; item: Project }
  > = [];

  for (const t of store.todos) {
    if (
      t.title.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({ type: "todo", item: t });
    }
  }

  for (const p of store.projects) {
    if (
      p.title.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({ type: "project", item: p });
    }
  }

  return results;
}
