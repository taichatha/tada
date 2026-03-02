import { computeNextOccurrence } from "../../core/recurrence.js";
import type { RecurrenceRule } from "../../core/types.js";

describe("computeNextOccurrence", () => {
  it("computes daily recurrence", () => {
    const rule: RecurrenceRule = { frequency: "daily", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-06-01");
    expect(result).toBe("2025-06-02");
  });

  it("computes daily with larger interval", () => {
    const rule: RecurrenceRule = { frequency: "daily", interval: 3 };
    const result = computeNextOccurrence(rule, "2025-06-01");
    expect(result).toBe("2025-06-04");
  });

  it("computes weekly recurrence", () => {
    const rule: RecurrenceRule = { frequency: "weekly", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-06-01");
    expect(result).toBe("2025-06-08");
  });

  it("computes bi-weekly recurrence (every 2 weeks)", () => {
    const rule: RecurrenceRule = { frequency: "weekly", interval: 2 };
    const result = computeNextOccurrence(rule, "2025-06-01");
    expect(result).toBe("2025-06-15");
  });

  it("computes monthly recurrence", () => {
    const rule: RecurrenceRule = { frequency: "monthly", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-06-15");
    expect(result).toBe("2025-07-15");
  });

  it("computes monthly with larger interval", () => {
    const rule: RecurrenceRule = { frequency: "monthly", interval: 3 };
    const result = computeNextOccurrence(rule, "2025-01-15");
    expect(result).toBe("2025-04-15");
  });

  it("computes yearly recurrence", () => {
    const rule: RecurrenceRule = { frequency: "yearly", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-03-15");
    expect(result).toBe("2026-03-15");
  });

  it("handles month-end edge case for monthly", () => {
    const rule: RecurrenceRule = { frequency: "monthly", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-01-31");
    // date-fns addMonths clamps to end of month: Jan 31 + 1 month = Feb 28
    expect(result).toBe("2025-02-28");
  });

  it("handles daily across month boundary", () => {
    const rule: RecurrenceRule = { frequency: "daily", interval: 1 };
    const result = computeNextOccurrence(rule, "2025-01-31");
    expect(result).toBe("2025-02-01");
  });

  it("handles yearly across leap year", () => {
    const rule: RecurrenceRule = { frequency: "yearly", interval: 1 };
    const result = computeNextOccurrence(rule, "2024-02-29");
    // 2025 is not a leap year, date-fns clamps to Feb 28
    expect(result).toBe("2025-02-28");
  });

  describe("endDate", () => {
    it("returns the next date when before endDate", () => {
      const rule: RecurrenceRule = {
        frequency: "daily",
        interval: 1,
        endDate: "2025-06-10",
      };
      const result = computeNextOccurrence(rule, "2025-06-01");
      expect(result).toBe("2025-06-02");
    });

    it("returns the next date when exactly on endDate", () => {
      const rule: RecurrenceRule = {
        frequency: "daily",
        interval: 1,
        endDate: "2025-06-02",
      };
      const result = computeNextOccurrence(rule, "2025-06-01");
      expect(result).toBe("2025-06-02");
    });

    it("returns null when next date would be past endDate", () => {
      const rule: RecurrenceRule = {
        frequency: "weekly",
        interval: 1,
        endDate: "2025-06-05",
      };
      // Next would be 2025-06-08, which is past endDate
      const result = computeNextOccurrence(rule, "2025-06-01");
      expect(result).toBeNull();
    });

    it("returns null when next date is one day past endDate", () => {
      const rule: RecurrenceRule = {
        frequency: "daily",
        interval: 1,
        endDate: "2025-06-01",
      };
      // Next would be 2025-06-02, past endDate of 2025-06-01
      const result = computeNextOccurrence(rule, "2025-06-01");
      expect(result).toBeNull();
    });
  });
});
