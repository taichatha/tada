import { generateId, findByPrefixOrThrow } from "./ids.js";
import type {
  TadaStore,
  Area,
  CreateAreaInput,
  UpdateAreaInput,
} from "./types.js";

function now(): string {
  return new Date().toISOString();
}

export function createArea(store: TadaStore, input: CreateAreaInput): Area {
  const area: Area = {
    id: generateId(),
    title: input.title,
    notes: input.notes ?? "",
    createdAt: now(),
    updatedAt: now(),
  };
  store.areas.push(area);
  return area;
}

export function updateArea(
  store: TadaStore,
  id: string,
  input: UpdateAreaInput,
): Area {
  const area = findByPrefixOrThrow(store.areas, id, "area");
  if (input.title !== undefined) area.title = input.title;
  if (input.notes !== undefined) area.notes = input.notes;
  area.updatedAt = now();
  return area;
}

export function deleteArea(store: TadaStore, id: string): void {
  const area = findByPrefixOrThrow(store.areas, id, "area");
  // Nullify areaId on projects
  store.projects
    .filter((p) => p.areaId === area.id)
    .forEach((p) => {
      p.areaId = null;
    });
  const idx = store.areas.indexOf(area);
  store.areas.splice(idx, 1);
}

export function getArea(store: TadaStore, id: string): Area | undefined {
  return store.areas.find((a) => a.id.startsWith(id));
}

export function listAreas(store: TadaStore): Area[] {
  return store.areas;
}
