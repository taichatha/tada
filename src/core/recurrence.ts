import { addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import type { RecurrenceRule } from "./types.js";

export function computeNextOccurrence(
  rule: RecurrenceRule,
  fromDate: string,
): string | null {
  const date = new Date(fromDate + "T00:00:00");
  let next: Date;

  switch (rule.frequency) {
    case "daily":
      next = addDays(date, rule.interval);
      break;
    case "weekly":
      next = addWeeks(date, rule.interval);
      break;
    case "monthly":
      next = addMonths(date, rule.interval);
      break;
    case "yearly":
      next = addYears(date, rule.interval);
      break;
  }

  const nextStr = format(next, "yyyy-MM-dd");

  if (rule.endDate && nextStr > rule.endDate) {
    return null;
  }

  return nextStr;
}
