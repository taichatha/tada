import type { TadaStore, Todo, Project, Area } from "../../core/types.js";

export function emptyStore(): TadaStore {
  return { version: 1, todos: [], projects: [], areas: [] };
}

export function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: overrides.id ?? "todo0001",
    title: overrides.title ?? "Test todo",
    notes: overrides.notes ?? "",
    status: overrides.status ?? "open",
    priority: overrides.priority ?? "none",
    tags: overrides.tags ?? [],
    projectId: overrides.projectId ?? null,
    areaId: overrides.areaId ?? null,
    scheduledDate: overrides.scheduledDate ?? null,
    deadline: overrides.deadline ?? null,
    recurrence: overrides.recurrence ?? null,
    parentId: overrides.parentId ?? null,
    completedAt: overrides.completedAt ?? null,
    createdAt: overrides.createdAt ?? "2025-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2025-01-01T00:00:00.000Z",
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: overrides.id ?? "proj0001",
    title: overrides.title ?? "Test project",
    notes: overrides.notes ?? "",
    areaId: overrides.areaId ?? null,
    status: overrides.status ?? "active",
    tags: overrides.tags ?? [],
    deadline: overrides.deadline ?? null,
    createdAt: overrides.createdAt ?? "2025-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2025-01-01T00:00:00.000Z",
  };
}

export function makeArea(overrides: Partial<Area> = {}): Area {
  return {
    id: overrides.id ?? "area0001",
    title: overrides.title ?? "Test area",
    notes: overrides.notes ?? "",
    createdAt: overrides.createdAt ?? "2025-01-01T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2025-01-01T00:00:00.000Z",
  };
}
