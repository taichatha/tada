import { addDays, format } from "date-fns";

export function resolveDate(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const lower = input.toLowerCase();
  const today = new Date();
  if (lower === "today") return format(today, "yyyy-MM-dd");
  if (lower === "tomorrow") return format(addDays(today, 1), "yyyy-MM-dd");
  return input;
}
