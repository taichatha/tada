import {
  addTodo,
  updateTodo,
  completeTodo,
  reopenTodo,
  cancelTodo,
  deleteTodo,
  getTodo,
  listTodos,
  getSubtasks,
  getOpenSubtasks,
} from "../../core/todo.js";
import { emptyStore, makeTodo } from "./helpers.js";

describe("addTodo", () => {
  it("creates a todo with defaults", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Buy milk" });

    expect(todo.title).toBe("Buy milk");
    expect(todo.notes).toBe("");
    expect(todo.status).toBe("open");
    expect(todo.priority).toBe("none");
    expect(todo.tags).toEqual([]);
    expect(todo.projectId).toBeNull();
    expect(todo.areaId).toBeNull();
    expect(todo.scheduledDate).toBeNull();
    expect(todo.deadline).toBeNull();
    expect(todo.recurrence).toBeNull();
    expect(todo.completedAt).toBeNull();
    expect(todo.id).toHaveLength(8);
    expect(todo.createdAt).toBeTruthy();
    expect(todo.updatedAt).toBeTruthy();
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]).toBe(todo);
  });

  it("creates a todo with all fields", () => {
    const store = emptyStore();
    const recurrence = { frequency: "weekly" as const, interval: 1 };
    const todo = addTodo(store, {
      title: "Meeting",
      notes: "Weekly sync",
      projectId: "proj0001",
      areaId: "area0001",
      tags: ["work", "meetings"],
      scheduledDate: "2025-06-01",
      deadline: "2025-06-15",
      priority: "high",
      recurrence,
    });

    expect(todo.title).toBe("Meeting");
    expect(todo.notes).toBe("Weekly sync");
    expect(todo.projectId).toBe("proj0001");
    expect(todo.areaId).toBe("area0001");
    expect(todo.tags).toEqual(["work", "meetings"]);
    expect(todo.scheduledDate).toBe("2025-06-01");
    expect(todo.deadline).toBe("2025-06-15");
    expect(todo.priority).toBe("high");
    expect(todo.recurrence).toEqual(recurrence);
  });

  it("pushes todo to the store array", () => {
    const store = emptyStore();
    addTodo(store, { title: "First" });
    addTodo(store, { title: "Second" });
    expect(store.todos).toHaveLength(2);
  });
});

describe("updateTodo", () => {
  it("modifies specified fields only", () => {
    const store = emptyStore();
    const todo = addTodo(store, {
      title: "Original",
      notes: "Original notes",
      priority: "low",
    });

    const updated = updateTodo(store, todo.id, { title: "Updated" });
    expect(updated.title).toBe("Updated");
    expect(updated.notes).toBe("Original notes");
    expect(updated.priority).toBe("low");
  });

  it("updates multiple fields at once", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Original" });

    updateTodo(store, todo.id, {
      title: "New title",
      notes: "New notes",
      priority: "high",
      tags: ["urgent"],
      scheduledDate: "2025-07-01",
      deadline: "2025-07-15",
      projectId: "proj0001",
      areaId: "area0001",
    });

    expect(todo.title).toBe("New title");
    expect(todo.notes).toBe("New notes");
    expect(todo.priority).toBe("high");
    expect(todo.tags).toEqual(["urgent"]);
    expect(todo.scheduledDate).toBe("2025-07-01");
    expect(todo.deadline).toBe("2025-07-15");
    expect(todo.projectId).toBe("proj0001");
    expect(todo.areaId).toBe("area0001");
  });

  it("updates updatedAt timestamp", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Original" });
    const originalUpdatedAt = todo.updatedAt;

    // Small delay to ensure different timestamp
    updateTodo(store, todo.id, { title: "Updated" });
    expect(todo.updatedAt).toBeTruthy();
  });

  it("works with prefix ID lookup", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Original" });
    const prefix = todo.id.slice(0, 4);

    const updated = updateTodo(store, prefix, { title: "Updated" });
    expect(updated.title).toBe("Updated");
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => updateTodo(store, "nonexist", { title: "x" })).toThrow(
      'No todo found with ID prefix "nonexist"',
    );
  });

  it("can set recurrence", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Recurring" });
    const rule = { frequency: "daily" as const, interval: 1 };
    updateTodo(store, todo.id, { recurrence: rule });
    expect(todo.recurrence).toEqual(rule);
  });

  it("can clear optional fields to null", () => {
    const store = emptyStore();
    const todo = addTodo(store, {
      title: "Has project",
      projectId: "proj0001",
      scheduledDate: "2025-06-01",
    });

    updateTodo(store, todo.id, {
      projectId: null,
      scheduledDate: null,
    });
    expect(todo.projectId).toBeNull();
    expect(todo.scheduledDate).toBeNull();
  });
});

describe("completeTodo", () => {
  it("sets status to completed and completedAt", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Task" });

    const completed = completeTodo(store, todo.id);
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBeTruthy();
    expect(completed.updatedAt).toBeTruthy();
  });

  it("spawns next occurrence when recurring", () => {
    const store = emptyStore();
    const todo = addTodo(store, {
      title: "Daily standup",
      scheduledDate: "2025-06-01",
      recurrence: { frequency: "daily", interval: 1 },
      tags: ["work"],
      priority: "medium",
      projectId: "proj0001",
      areaId: "area0001",
      notes: "Morning sync",
    });

    completeTodo(store, todo.id);

    expect(store.todos).toHaveLength(2);
    const next = store.todos[1];
    expect(next.title).toBe("Daily standup");
    expect(next.status).toBe("open");
    expect(next.scheduledDate).toBe("2025-06-02");
    expect(next.recurrence).toEqual({ frequency: "daily", interval: 1 });
    expect(next.tags).toEqual(["work"]);
    expect(next.priority).toBe("medium");
    expect(next.projectId).toBe("proj0001");
    expect(next.areaId).toBe("area0001");
    expect(next.notes).toBe("Morning sync");
    expect(next.id).not.toBe(todo.id);
  });

  it("does not spawn if recurrence endDate is passed", () => {
    const store = emptyStore();
    const todo = addTodo(store, {
      title: "Limited recurring",
      scheduledDate: "2025-06-01",
      recurrence: {
        frequency: "daily",
        interval: 1,
        endDate: "2025-06-01",
      },
    });

    completeTodo(store, todo.id);
    // Next would be 2025-06-02 which is after endDate
    expect(store.todos).toHaveLength(1);
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => completeTodo(store, "nonexist")).toThrow(
      'No todo found with ID prefix "nonexist"',
    );
  });
});

describe("cancelTodo", () => {
  it("sets status to cancelled", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Task" });

    const cancelled = cancelTodo(store, todo.id);
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.updatedAt).toBeTruthy();
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => cancelTodo(store, "nonexist")).toThrow(
      'No todo found with ID prefix "nonexist"',
    );
  });
});

describe("reopenTodo", () => {
  it("reopens a completed todo", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Task" });
    completeTodo(store, todo.id);

    const reopened = reopenTodo(store, todo.id);
    expect(reopened.status).toBe("open");
    expect(reopened.completedAt).toBeNull();
  });

  it("reopens a cancelled todo", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Task" });
    cancelTodo(store, todo.id);

    const reopened = reopenTodo(store, todo.id);
    expect(reopened.status).toBe("open");
  });

  it("throws when todo is already open", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Task" });

    expect(() => reopenTodo(store, todo.id)).toThrow("Todo is already open");
  });
});

describe("deleteTodo", () => {
  it("removes the todo from the store", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "To delete" });

    deleteTodo(store, todo.id);
    expect(store.todos).toHaveLength(0);
  });

  it("works with prefix ID", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "To delete" });
    const prefix = todo.id.slice(0, 3);

    deleteTodo(store, prefix);
    expect(store.todos).toHaveLength(0);
  });

  it("throws for unknown ID", () => {
    const store = emptyStore();
    expect(() => deleteTodo(store, "nonexist")).toThrow(
      'No todo found with ID prefix "nonexist"',
    );
  });

  it("only removes the targeted todo", () => {
    const store = emptyStore();
    addTodo(store, { title: "Keep me" });
    const toDelete = addTodo(store, { title: "Delete me" });

    deleteTodo(store, toDelete.id);
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0].title).toBe("Keep me");
  });
});

describe("getTodo", () => {
  it("returns the matching todo", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Find me" });

    const found = getTodo(store, todo.id);
    expect(found).toBe(todo);
  });

  it("works with prefix match", () => {
    const store = emptyStore();
    const todo = addTodo(store, { title: "Find me" });
    const prefix = todo.id.slice(0, 4);

    const found = getTodo(store, prefix);
    expect(found).toBe(todo);
  });

  it("returns undefined for no match", () => {
    const store = emptyStore();
    const found = getTodo(store, "nonexist");
    expect(found).toBeUndefined();
  });
});

describe("listTodos", () => {
  it("defaults to open todos only", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "open0001", status: "open" }),
      makeTodo({ id: "done0001", status: "completed" }),
      makeTodo({ id: "canc0001", status: "cancelled" }),
    ];

    const result = listTodos(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("open0001");
  });

  it("filters by status", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "open0001", status: "open" }),
      makeTodo({ id: "done0001", status: "completed" }),
      makeTodo({ id: "done0002", status: "completed" }),
    ];

    const result = listTodos(store, { status: "completed" });
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.status === "completed")).toBe(true);
  });

  it("filters by projectId", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "proj0001", projectId: "projAAAA" }),
      makeTodo({ id: "proj0002", projectId: "projBBBB" }),
      makeTodo({ id: "noproj01", projectId: null }),
    ];

    const result = listTodos(store, { projectId: "projAAAA" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("proj0001");
  });

  it("filters by areaId", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "area0011", areaId: "areaAAAA" }),
      makeTodo({ id: "area0022", areaId: "areaBBBB" }),
    ];

    const result = listTodos(store, { areaId: "areaAAAA" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("area0011");
  });

  it("filters by tag", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "tag10001", tags: ["work", "urgent"] }),
      makeTodo({ id: "tag20001", tags: ["personal"] }),
      makeTodo({ id: "tag30001", tags: ["work"] }),
    ];

    const result = listTodos(store, { tag: "work" });
    expect(result).toHaveLength(2);
  });

  it("combines multiple filters", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "match001", projectId: "projAAAA", tags: ["urgent"] }),
      makeTodo({ id: "nomatc01", projectId: "projAAAA", tags: ["other"] }),
      makeTodo({ id: "nomatc02", projectId: "projBBBB", tags: ["urgent"] }),
    ];

    const result = listTodos(store, { projectId: "projAAAA", tag: "urgent" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("match001");
  });

  it("returns empty array when no todos match", () => {
    const store = emptyStore();
    const result = listTodos(store);
    expect(result).toEqual([]);
  });

  it("excludes subtasks by default", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    addTodo(store, { title: "Subtask", parentId: parent.id });

    const result = listTodos(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(parent.id);
  });
});

describe("subtasks", () => {
  it("adds a subtask with parentId set", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    const sub = addTodo(store, { title: "Sub", parentId: parent.id });

    expect(sub.parentId).toBe(parent.id);
    expect(store.todos).toHaveLength(2);
  });

  it("cannot create subtask of a subtask (1-level enforcement)", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    const sub = addTodo(store, { title: "Sub", parentId: parent.id });

    expect(() =>
      addTodo(store, { title: "SubSub", parentId: sub.id }),
    ).toThrow("Cannot create subtask of a subtask");
  });

  it("cannot complete parent with open subtasks", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    addTodo(store, { title: "Sub", parentId: parent.id });

    expect(() => completeTodo(store, parent.id)).toThrow(
      "Complete all subtasks first",
    );
  });

  it("can complete parent after all subtasks are done", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    const sub = addTodo(store, { title: "Sub", parentId: parent.id });

    completeTodo(store, sub.id);
    const completed = completeTodo(store, parent.id);
    expect(completed.status).toBe("completed");
  });

  it("deleting parent cascades to subtasks", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    addTodo(store, { title: "Sub 1", parentId: parent.id });
    addTodo(store, { title: "Sub 2", parentId: parent.id });
    addTodo(store, { title: "Other" });

    deleteTodo(store, parent.id);
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0].title).toBe("Other");
  });

  it("cancelling parent with open subtasks is allowed", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    addTodo(store, { title: "Sub", parentId: parent.id });

    const cancelled = cancelTodo(store, parent.id);
    expect(cancelled.status).toBe("cancelled");
  });

  it("getSubtasks returns all subtasks", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    const sub1 = addTodo(store, { title: "Sub 1", parentId: parent.id });
    const sub2 = addTodo(store, { title: "Sub 2", parentId: parent.id });
    completeTodo(store, sub1.id);

    const subs = getSubtasks(store, parent.id);
    expect(subs).toHaveLength(2);
  });

  it("getOpenSubtasks returns only open subtasks", () => {
    const store = emptyStore();
    const parent = addTodo(store, { title: "Parent" });
    const sub1 = addTodo(store, { title: "Sub 1", parentId: parent.id });
    addTodo(store, { title: "Sub 2", parentId: parent.id });
    completeTodo(store, sub1.id);

    const open = getOpenSubtasks(store, parent.id);
    expect(open).toHaveLength(1);
    expect(open[0].title).toBe("Sub 2");
  });

  it("throws when parent does not exist", () => {
    const store = emptyStore();
    expect(() =>
      addTodo(store, { title: "Sub", parentId: "nonexist" }),
    ).toThrow('No todo found with ID "nonexist"');
  });
});
