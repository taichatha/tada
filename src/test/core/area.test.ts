import {
  createArea,
  updateArea,
  deleteArea,
  getArea,
  listAreas,
} from "../../core/area.js";
import { emptyStore, makeProject, makeArea } from "./helpers.js";

describe("createArea", () => {
  it("creates an area with defaults", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Work" });

    expect(area.title).toBe("Work");
    expect(area.notes).toBe("");
    expect(area.id).toHaveLength(8);
    expect(area.createdAt).toBeTruthy();
    expect(area.updatedAt).toBeTruthy();
    expect(store.areas).toHaveLength(1);
    expect(store.areas[0]).toBe(area);
  });

  it("creates an area with notes", () => {
    const store = emptyStore();
    const area = createArea(store, {
      title: "Personal",
      notes: "Non-work stuff",
    });

    expect(area.title).toBe("Personal");
    expect(area.notes).toBe("Non-work stuff");
  });
});

describe("updateArea", () => {
  it("modifies title only", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Old", notes: "Keep me" });

    const updated = updateArea(store, area.id, { title: "New" });
    expect(updated.title).toBe("New");
    expect(updated.notes).toBe("Keep me");
  });

  it("modifies notes only", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Keep me", notes: "Old" });

    const updated = updateArea(store, area.id, { notes: "New notes" });
    expect(updated.title).toBe("Keep me");
    expect(updated.notes).toBe("New notes");
  });

  it("updates updatedAt timestamp", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Area" });
    const before = area.updatedAt;

    updateArea(store, area.id, { title: "Updated" });
    expect(area.updatedAt).toBeTruthy();
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => updateArea(store, "nonexist", { title: "x" })).toThrow(
      'No area found with ID prefix "nonexist"',
    );
  });
});

describe("deleteArea", () => {
  it("removes the area from the store", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "To delete" });

    deleteArea(store, area.id);
    expect(store.areas).toHaveLength(0);
  });

  it("nullifies areaId on associated projects", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Doomed area" });

    store.projects.push(
      makeProject({ id: "proj0001", areaId: area.id }),
      makeProject({ id: "proj0002", areaId: area.id }),
      makeProject({ id: "proj0003", areaId: "other123" }),
    );

    deleteArea(store, area.id);

    expect(store.projects[0].areaId).toBeNull();
    expect(store.projects[1].areaId).toBeNull();
    expect(store.projects[2].areaId).toBe("other123");
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => deleteArea(store, "nonexist")).toThrow(
      'No area found with ID prefix "nonexist"',
    );
  });

  it("only removes the targeted area", () => {
    const store = emptyStore();
    const keep = createArea(store, { title: "Keep me" });
    const remove = createArea(store, { title: "Delete me" });

    deleteArea(store, remove.id);
    expect(store.areas).toHaveLength(1);
    expect(store.areas[0]).toBe(keep);
  });
});

describe("getArea", () => {
  it("returns the matching area", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Find me" });

    const found = getArea(store, area.id);
    expect(found).toBe(area);
  });

  it("works with prefix", () => {
    const store = emptyStore();
    const area = createArea(store, { title: "Find me" });
    const prefix = area.id.slice(0, 4);

    const found = getArea(store, prefix);
    expect(found).toBe(area);
  });

  it("returns undefined for no match", () => {
    const store = emptyStore();
    expect(getArea(store, "nonexist")).toBeUndefined();
  });
});

describe("listAreas", () => {
  it("returns all areas", () => {
    const store = emptyStore();
    store.areas = [
      makeArea({ id: "area0001", title: "Work" }),
      makeArea({ id: "area0002", title: "Personal" }),
      makeArea({ id: "area0003", title: "Health" }),
    ];

    const result = listAreas(store);
    expect(result).toHaveLength(3);
  });

  it("returns empty array when no areas exist", () => {
    const store = emptyStore();
    const result = listAreas(store);
    expect(result).toEqual([]);
  });
});
