import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const generate = customAlphabet(alphabet, 8);

export function generateId(): string {
  return generate();
}

export function findByPrefix<T extends { id: string }>(
  items: T[],
  prefix: string,
): T | undefined {
  const matches = items.filter((item) => item.id.startsWith(prefix));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous ID prefix "${prefix}" matches ${matches.length} items`,
    );
  }
  return undefined;
}

export function findByPrefixOrThrow<T extends { id: string }>(
  items: T[],
  prefix: string,
  label = "item",
): T {
  const result = findByPrefix(items, prefix);
  if (!result) {
    throw new Error(`No ${label} found with ID prefix "${prefix}"`);
  }
  return result;
}
