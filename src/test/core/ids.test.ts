import { generateId, findByPrefix, findByPrefixOrThrow } from "../../core/ids.js";

describe("generateId", () => {
  it("returns an 8-character string", () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it("contains only lowercase alphanumeric characters", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-z]{8}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("findByPrefix", () => {
  const items = [
    { id: "abc12345" },
    { id: "abc67890" },
    { id: "xyz00001" },
  ];

  it("returns the unique match for an unambiguous prefix", () => {
    const result = findByPrefix(items, "xyz");
    expect(result).toBe(items[2]);
  });

  it("returns the item when full ID is given", () => {
    const result = findByPrefix(items, "abc12345");
    expect(result).toBe(items[0]);
  });

  it("returns undefined when no item matches", () => {
    const result = findByPrefix(items, "qqq");
    expect(result).toBeUndefined();
  });

  it("throws on ambiguous prefix", () => {
    expect(() => findByPrefix(items, "abc")).toThrow(
      'Ambiguous ID prefix "abc" matches 2 items',
    );
  });

  it("returns undefined for empty list", () => {
    const result = findByPrefix([], "abc");
    expect(result).toBeUndefined();
  });
});

describe("findByPrefixOrThrow", () => {
  const items = [{ id: "abc12345" }, { id: "xyz00001" }];

  it("returns the matched item", () => {
    const result = findByPrefixOrThrow(items, "abc");
    expect(result).toBe(items[0]);
  });

  it("throws with default label when not found", () => {
    expect(() => findByPrefixOrThrow(items, "qqq")).toThrow(
      'No item found with ID prefix "qqq"',
    );
  });

  it("throws with custom label when not found", () => {
    expect(() => findByPrefixOrThrow(items, "qqq", "todo")).toThrow(
      'No todo found with ID prefix "qqq"',
    );
  });

  it("propagates ambiguous error from findByPrefix", () => {
    const dupes = [{ id: "aaa111" }, { id: "aaa222" }];
    expect(() => findByPrefixOrThrow(dupes, "aaa")).toThrow("Ambiguous");
  });
});
