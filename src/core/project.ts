import { generateId, findByPrefixOrThrow } from "./ids.js";
import type {
  TadaStore,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilter,
} from "./types.js";

function now(): string {
  return new Date().toISOString();
}

export function createProject(
  store: TadaStore,
  input: CreateProjectInput,
): Project {
  const project: Project = {
    id: generateId(),
    title: input.title,
    notes: input.notes ?? "",
    areaId: input.areaId ?? null,
    status: "active",
    tags: input.tags ?? [],
    deadline: input.deadline ?? null,
    createdAt: now(),
    updatedAt: now(),
  };
  store.projects.push(project);
  return project;
}

export function updateProject(
  store: TadaStore,
  id: string,
  input: UpdateProjectInput,
): Project {
  const project = findByPrefixOrThrow(store.projects, id, "project");
  if (input.title !== undefined) project.title = input.title;
  if (input.notes !== undefined) project.notes = input.notes;
  if (input.areaId !== undefined) project.areaId = input.areaId;
  if (input.status !== undefined) project.status = input.status;
  if (input.tags !== undefined) project.tags = input.tags;
  if (input.deadline !== undefined) project.deadline = input.deadline;
  project.updatedAt = now();
  return project;
}

export function completeProject(store: TadaStore, id: string): Project {
  const project = findByPrefixOrThrow(store.projects, id, "project");
  project.status = "completed";
  project.updatedAt = now();
  return project;
}

export function deleteProject(store: TadaStore, id: string): void {
  const project = findByPrefixOrThrow(store.projects, id, "project");
  // Orphan todos to inbox
  store.todos
    .filter((t) => t.projectId === project.id)
    .forEach((t) => {
      t.projectId = null;
    });
  const idx = store.projects.indexOf(project);
  store.projects.splice(idx, 1);
}

export function getProject(
  store: TadaStore,
  id: string,
): Project | undefined {
  return store.projects.find((p) => p.id.startsWith(id));
}

export function listProjects(
  store: TadaStore,
  filter?: ProjectFilter,
): Project[] {
  let projects = store.projects;

  if (filter?.status) {
    projects = projects.filter((p) => p.status === filter.status);
  } else {
    projects = projects.filter((p) => p.status === "active");
  }

  if (filter?.areaId) {
    projects = projects.filter((p) => p.areaId === filter.areaId);
  }

  return projects;
}
