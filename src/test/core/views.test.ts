import { format, addDays, subDays } from "date-fns";
import {
  getInbox,
  getToday,
  getUpcoming,
  getByTag,
  getProjectTodos,
  search,
  sortTodos,
} from "../../core/views.js";
import { emptyStore, makeTodo, makeProject } from "./helpers.js";

function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

function pastDate(daysAgo: number): string {
  return format(subDays(new Date(), daysAgo), "yyyy-MM-dd");
}

function futureDate(daysAhead: number): string {
  return format(addDays(new Date(), daysAhead), "yyyy-MM-dd");
}

describe("getInbox", () => {
  it("returns open todos without a projectId", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "inbox001", status: "open", projectId: null }),
      makeTodo({ id: "inbox002", status: "open", projectId: null }),
      makeTodo({ id: "hasproj1", status: "open", projectId: "proj0001" }),
      makeTodo({ id: "compltd1", status: "completed", projectId: null }),
    ];

    const result = getInbox(store);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(["inbox001", "inbox002"]);
  });

  it("returns empty array when all todos have projects", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "hasproj1", status: "open", projectId: "proj0001" }),
    ];

    const result = getInbox(store);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty store", () => {
    const store = emptyStore();
    expect(getInbox(store)).toEqual([]);
  });

  it("excludes subtasks", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "parent01", status: "open", projectId: null }),
      makeTodo({ id: "subtsk01", status: "open", projectId: null, parentId: "parent01" }),
    ];

    const result = getInbox(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("parent01");
  });
});

describe("getToday", () => {
  it("returns todos scheduled for today", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "today001", scheduledDate: todayStr() }),
      makeTodo({ id: "future01", scheduledDate: futureDate(5) }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("today001");
  });

  it("returns todos with deadline today", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "due00001", deadline: todayStr() }),
      makeTodo({ id: "future01", deadline: futureDate(5) }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("due00001");
  });

  it("includes overdue items (past scheduledDate)", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "overdue1", scheduledDate: pastDate(3) }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("overdue1");
  });

  it("includes overdue items (past deadline)", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "overdue1", deadline: pastDate(2) }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("overdue1");
  });

  it("deduplicates todos that match both scheduledDate and deadline", () => {
    const store = emptyStore();
    const today = todayStr();
    store.todos = [
      makeTodo({
        id: "both0001",
        scheduledDate: today,
        deadline: today,
      }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
  });

  it("excludes completed and cancelled todos", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({
        id: "done0001",
        status: "completed",
        scheduledDate: todayStr(),
      }),
      makeTodo({
        id: "canc0001",
        status: "cancelled",
        deadline: todayStr(),
      }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(0);
  });

  it("excludes todos with no scheduled date or deadline", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "nodate01" }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(0);
  });

  it("excludes subtasks", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "parent01", scheduledDate: todayStr() }),
      makeTodo({ id: "subtsk01", scheduledDate: todayStr(), parentId: "parent01" }),
    ];

    const result = getToday(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("parent01");
  });
});

describe("getUpcoming", () => {
  it("returns future scheduled todos sorted by date", () => {
    const store = emptyStore();
    const date1 = futureDate(3);
    const date2 = futureDate(1);
    const date3 = futureDate(7);

    store.todos = [
      makeTodo({ id: "later001", scheduledDate: date1 }),
      makeTodo({ id: "soon0001", scheduledDate: date2 }),
      makeTodo({ id: "farout01", scheduledDate: date3 }),
    ];

    const result = getUpcoming(store);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("soon0001");
    expect(result[1].id).toBe("later001");
    expect(result[2].id).toBe("farout01");
  });

  it("excludes todos scheduled for today or past", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "today001", scheduledDate: todayStr() }),
      makeTodo({ id: "past0001", scheduledDate: pastDate(1) }),
      makeTodo({ id: "future01", scheduledDate: futureDate(1) }),
    ];

    const result = getUpcoming(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("future01");
  });

  it("excludes completed/cancelled todos", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({
        id: "done0001",
        status: "completed",
        scheduledDate: futureDate(1),
      }),
      makeTodo({
        id: "open0001",
        status: "open",
        scheduledDate: futureDate(1),
      }),
    ];

    const result = getUpcoming(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("open0001");
  });

  it("excludes todos with no scheduledDate", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "nodate01", deadline: futureDate(5) }),
    ];

    const result = getUpcoming(store);
    expect(result).toHaveLength(0);
  });

  it("excludes subtasks", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "parent01", scheduledDate: futureDate(3) }),
      makeTodo({ id: "subtsk01", scheduledDate: futureDate(3), parentId: "parent01" }),
    ];

    const result = getUpcoming(store);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("parent01");
  });
});

describe("getByTag", () => {
  it("returns open todos with the specified tag", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "tagged01", tags: ["work", "urgent"] }),
      makeTodo({ id: "tagged02", tags: ["work"] }),
      makeTodo({ id: "nowork01", tags: ["personal"] }),
    ];

    const result = getByTag(store, "work");
    expect(result).toHaveLength(2);
  });

  it("excludes non-open todos", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "open0001", status: "open", tags: ["work"] }),
      makeTodo({ id: "done0001", status: "completed", tags: ["work"] }),
    ];

    const result = getByTag(store, "work");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("open0001");
  });

  it("returns empty array when no todos have the tag", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "notag001", tags: [] }),
    ];

    const result = getByTag(store, "nonexistent");
    expect(result).toEqual([]);
  });
});

describe("getProjectTodos", () => {
  it("returns open todos for the given project", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", projectId: "projAAAA" }),
      makeTodo({ id: "todo0002", projectId: "projAAAA" }),
      makeTodo({ id: "todo0003", projectId: "projBBBB" }),
      makeTodo({
        id: "todo0004",
        projectId: "projAAAA",
        status: "completed",
      }),
    ];

    const result = getProjectTodos(store, "projAAAA");
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.projectId === "projAAAA")).toBe(true);
  });

  it("returns empty array for project with no todos", () => {
    const store = emptyStore();
    expect(getProjectTodos(store, "projAAAA")).toEqual([]);
  });
});

describe("search", () => {
  it("matches todos by title", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", title: "Buy groceries" }),
      makeTodo({ id: "todo0002", title: "Fix bug" }),
    ];

    const results = search(store, "groceries");
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("todo");
    expect(results[0].item.id).toBe("todo0001");
  });

  it("matches todos by notes", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", title: "Shopping", notes: "milk and eggs" }),
    ];

    const results = search(store, "eggs");
    expect(results).toHaveLength(1);
  });

  it("matches todos by tags", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", title: "Task", tags: ["important"] }),
    ];

    const results = search(store, "important");
    expect(results).toHaveLength(1);
  });

  it("matches projects by title", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "proj0001", title: "Website Redesign" }),
    ];

    const results = search(store, "redesign");
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("project");
  });

  it("matches projects by notes", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "proj0001", title: "Project", notes: "quarterly review" }),
    ];

    const results = search(store, "quarterly");
    expect(results).toHaveLength(1);
  });

  it("matches projects by tags", () => {
    const store = emptyStore();
    store.projects = [
      makeProject({ id: "proj0001", title: "Project", tags: ["engineering"] }),
    ];

    const results = search(store, "engineering");
    expect(results).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", title: "Buy GROCERIES" }),
    ];

    const results = search(store, "groceries");
    expect(results).toHaveLength(1);
  });

  it("returns both todos and projects that match", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "todo0001", title: "Design mockup" }),
    ];
    store.projects = [
      makeProject({ id: "proj0001", title: "Design system" }),
    ];

    const results = search(store, "design");
    expect(results).toHaveLength(2);
    expect(results[0].type).toBe("todo");
    expect(results[1].type).toBe("project");
  });

  it("returns empty array when nothing matches", () => {
    const store = emptyStore();
    store.todos = [makeTodo({ id: "todo0001", title: "Something" })];

    const results = search(store, "zzzznotfound");
    expect(results).toEqual([]);
  });

  it("searches all todos regardless of status", () => {
    const store = emptyStore();
    store.todos = [
      makeTodo({ id: "open0001", title: "Open task", status: "open" }),
      makeTodo({ id: "done0001", title: "Done task", status: "completed" }),
      makeTodo({ id: "canc0001", title: "Cancelled task", status: "cancelled" }),
    ];

    const results = search(store, "task");
    expect(results).toHaveLength(3);
  });
});

describe("sortTodos", () => {
  it("sorts by title alphabetically", () => {
    const todos = [
      makeTodo({ id: "todo0001", title: "Zebra" }),
      makeTodo({ id: "todo0002", title: "Apple" }),
      makeTodo({ id: "todo0003", title: "Mango" }),
    ];

    const sorted = sortTodos(todos, "alpha");
    expect(sorted.map((t) => t.title)).toEqual(["Apple", "Mango", "Zebra"]);
  });

  it("alpha sort is case-insensitive", () => {
    const todos = [
      makeTodo({ id: "todo0001", title: "banana" }),
      makeTodo({ id: "todo0002", title: "Apple" }),
    ];

    const sorted = sortTodos(todos, "alpha");
    expect(sorted[0].title).toBe("Apple");
    expect(sorted[1].title).toBe("banana");
  });

  it("sorts by createdAt ascending", () => {
    const todos = [
      makeTodo({ id: "todo0001", createdAt: "2025-06-03T00:00:00.000Z" }),
      makeTodo({ id: "todo0002", createdAt: "2025-06-01T00:00:00.000Z" }),
      makeTodo({ id: "todo0003", createdAt: "2025-06-02T00:00:00.000Z" }),
    ];

    const sorted = sortTodos(todos, "created");
    expect(sorted.map((t) => t.id)).toEqual(["todo0002", "todo0003", "todo0001"]);
  });

  it("sorts by deadline ascending with nulls at end", () => {
    const todos = [
      makeTodo({ id: "nodue001", deadline: null }),
      makeTodo({ id: "due00002", deadline: "2025-07-01" }),
      makeTodo({ id: "due00001", deadline: "2025-06-15" }),
    ];

    const sorted = sortTodos(todos, "due");
    expect(sorted.map((t) => t.id)).toEqual(["due00001", "due00002", "nodue001"]);
  });

  it("does not mutate the original array", () => {
    const todos = [
      makeTodo({ id: "todo0001", title: "B" }),
      makeTodo({ id: "todo0002", title: "A" }),
    ];

    const sorted = sortTodos(todos, "alpha");
    expect(todos[0].title).toBe("B");
    expect(sorted[0].title).toBe("A");
  });
});
