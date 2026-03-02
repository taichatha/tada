import {
  createProject,
  updateProject,
  completeProject,
  deleteProject,
  getProject,
  listProjects,
} from "../../core/project.js";
import { emptyStore, makeTodo, makeProject } from "./helpers.js";

describe("createProject", () => {
  it("creates a project with defaults", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Website Redesign" });

    expect(project.title).toBe("Website Redesign");
    expect(project.notes).toBe("");
    expect(project.areaId).toBeNull();
    expect(project.status).toBe("active");
    expect(project.tags).toEqual([]);
    expect(project.deadline).toBeNull();
    expect(project.id).toHaveLength(8);
    expect(project.createdAt).toBeTruthy();
    expect(project.updatedAt).toBeTruthy();
    expect(store.projects).toHaveLength(1);
    expect(store.projects[0]).toBe(project);
  });

  it("creates a project with all fields", () => {
    const store = emptyStore();
    const project = createProject(store, {
      title: "Q3 Planning",
      notes: "Quarterly goals",
      areaId: "area0001",
      tags: ["planning", "q3"],
      deadline: "2025-09-30",
    });

    expect(project.title).toBe("Q3 Planning");
    expect(project.notes).toBe("Quarterly goals");
    expect(project.areaId).toBe("area0001");
    expect(project.tags).toEqual(["planning", "q3"]);
    expect(project.deadline).toBe("2025-09-30");
  });
});

describe("updateProject", () => {
  it("modifies specified fields only", () => {
    const store = emptyStore();
    const project = createProject(store, {
      title: "Original",
      notes: "Keep these notes",
    });

    const updated = updateProject(store, project.id, { title: "Updated" });
    expect(updated.title).toBe("Updated");
    expect(updated.notes).toBe("Keep these notes");
  });

  it("can update status directly", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Project" });

    updateProject(store, project.id, { status: "on_hold" });
    expect(project.status).toBe("on_hold");
  });

  it("can update tags and deadline", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Project" });

    updateProject(store, project.id, {
      tags: ["new-tag"],
      deadline: "2025-12-31",
    });
    expect(project.tags).toEqual(["new-tag"]);
    expect(project.deadline).toBe("2025-12-31");
  });

  it("can change areaId", () => {
    const store = emptyStore();
    const project = createProject(store, {
      title: "Project",
      areaId: "area0001",
    });

    updateProject(store, project.id, { areaId: "area0002" });
    expect(project.areaId).toBe("area0002");
  });

  it("can clear areaId to null", () => {
    const store = emptyStore();
    const project = createProject(store, {
      title: "Project",
      areaId: "area0001",
    });

    updateProject(store, project.id, { areaId: null });
    expect(project.areaId).toBeNull();
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => updateProject(store, "nonexist", { title: "x" })).toThrow(
      'No project found with ID prefix "nonexist"',
    );
  });
});

describe("completeProject", () => {
  it("sets status to completed", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Project" });

    const completed = completeProject(store, project.id);
    expect(completed.status).toBe("completed");
    expect(completed.updatedAt).toBeTruthy();
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => completeProject(store, "nonexist")).toThrow(
      'No project found with ID prefix "nonexist"',
    );
  });
});

describe("deleteProject", () => {
  it("removes the project from the store", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "To delete" });

    deleteProject(store, project.id);
    expect(store.projects).toHaveLength(0);
  });

  it("orphans associated todos to inbox (sets projectId to null)", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Doomed project" });

    store.todos.push(
      makeTodo({ id: "todo0001", projectId: project.id }),
      makeTodo({ id: "todo0002", projectId: project.id }),
      makeTodo({ id: "todo0003", projectId: "other123" }),
    );

    deleteProject(store, project.id);

    expect(store.todos[0].projectId).toBeNull();
    expect(store.todos[1].projectId).toBeNull();
    expect(store.todos[2].projectId).toBe("other123");
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => deleteProject(store, "nonexist")).toThrow(
      'No project found with ID prefix "nonexist"',
    );
  });
});

describe("getProject", () => {
  it("returns the matching project", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Find me" });

    const found = getProject(store, project.id);
    expect(found).toBe(project);
  });

  it("works with prefix", () => {
    const store = emptyStore();
    const project = createProject(store, { title: "Find me" });
    const prefix = project.id.slice(0, 4);

    const found = getProject(store, prefix);
    expect(found).toBe(project);
  });

  it("returns undefined for no match", () => {
    const store = emptyStore();
    expect(getProject(store, "nonexist")).toBeUndefined();
  });
});

describe("listProjects", () => {
  it("defaults to active projects only", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "acti0001", status: "active" }),
      makeProject({ id: "comp0001", status: "completed" }),
      makeProject({ id: "hold0001", status: "on_hold" }),
    ];

    const result = listProjects(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("acti0001");
  });

  it("filters by status", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "acti0001", status: "active" }),
      makeProject({ id: "comp0001", status: "completed" }),
      makeProject({ id: "comp0002", status: "completed" }),
    ];

    const result = listProjects(store, { status: "completed" });
    expect(result).toHaveLength(2);
  });

  it("filters by areaId", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "area0011", areaId: "areaAAAA" }),
      makeProject({ id: "area0022", areaId: "areaBBBB" }),
      makeProject({ id: "noareea1", areaId: null }),
    ];

    const result = listProjects(store, { areaId: "areaAAAA" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("area0011");
  });

  it("combines status and areaId filters", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "match001", status: "active", areaId: "areaAAAA" }),
      makeProject({
        id: "nomatch1",
        status: "completed",
        areaId: "areaAAAA",
      }),
      makeProject({ id: "nomatch2", status: "active", areaId: "areaBBBB" }),
    ];

    const result = listProjects(store, {
      status: "active",
      areaId: "areaAAAA",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("match001");
  });

  it("returns empty array when no projects exist", () => {
    const store = emptyStore();
    const result = listProjects(store);
    expect(result).toEqual([]);
  });
});
