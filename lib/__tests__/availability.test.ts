import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateSlots,
  removeBusySlots,
  removeBookedSlots,
  removeTooSoonSlots,
  groupSlotsByDate,
} from "../availability";
import type { WeeklyRule } from "../config";

const TUESDAY_WEDNESDAY: WeeklyRule[] = [
  { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" }, // Tue, 3h window
  { dayOfWeek: 3, startTime: "09:00", endTime: "10:00" }, // Wed, 1h window
];

test("generateSlots produces the expected count and spacing for a 60-min session", () => {
  const slots = generateSlots({
    fromDate: "2026-08-25", // Tuesday
    days: 2,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 60,
    timezone: "America/Chicago",
  });

  // Tue 9-12 => 3 slots, Wed 9-10 => 1 slot
  assert.equal(slots.length, 4);
  assert.equal(slots[0].startsAt.getTime() < slots[1].startsAt.getTime(), true);
});

test("generateSlots is pure -- same input always produces same output", () => {
  const args = {
    fromDate: "2026-08-25",
    days: 5,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 45,
    timezone: "America/Chicago",
  };
  const a = generateSlots(args);
  const b = generateSlots(args);
  assert.deepEqual(
    a.map((s) => s.startsAt.toISOString()),
    b.map((s) => s.startsAt.toISOString())
  );
});

test("generateSlots handles the spring-forward DST transition without gaps", () => {
  // 2026-03-08 is the US DST spring-forward Sunday; use a Sunday rule.
  const rules: WeeklyRule[] = [{ dayOfWeek: 0, startTime: "01:00", endTime: "04:00" }];
  const slots = generateSlots({
    fromDate: "2026-03-08",
    days: 1,
    weeklyRules: rules,
    sessionLengthMinutes: 30,
    timezone: "America/Chicago",
  });
  assert.ok(slots.length > 0);
  // Every slot must still be strictly increasing and 30 minutes apart in UTC.
  for (let i = 1; i < slots.length; i++) {
    const diffMinutes =
      (slots[i].startsAt.getTime() - slots[i - 1].startsAt.getTime()) / 60000;
    assert.equal(diffMinutes, 30);
  }
});

test("removeBusySlots filters out overlapping intervals only", () => {
  const slots = generateSlots({
    fromDate: "2026-08-25",
    days: 1,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 60,
    timezone: "America/Chicago",
  });
  const busy = [{ start: slots[0].startsAt, end: slots[0].endsAt }];
  const result = removeBusySlots(slots, busy);
  assert.equal(result.length, slots.length - 1);
});

test("removeBookedSlots filters by exact start time", () => {
  const slots = generateSlots({
    fromDate: "2026-08-25",
    days: 1,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 60,
    timezone: "America/Chicago",
  });
  const result = removeBookedSlots(slots, [slots[1].startsAt]);
  assert.equal(result.length, slots.length - 1);
});

test("removeTooSoonSlots respects the minimum notice window", () => {
  const slots = generateSlots({
    fromDate: "2026-08-25",
    days: 1,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 60,
    timezone: "America/Chicago",
  });
  const now = new Date(slots[0].startsAt.getTime() - 30 * 60000); // 30 min before first slot
  const result = removeTooSoonSlots(slots, now, 4); // 4h notice required
  assert.equal(result.length, 0);
});

test("groupSlotsByDate groups and sorts by local date", () => {
  const slots = generateSlots({
    fromDate: "2026-08-25",
    days: 2,
    weeklyRules: TUESDAY_WEDNESDAY,
    sessionLengthMinutes: 60,
    timezone: "America/Chicago",
  });
  const grouped = groupSlotsByDate(slots, "America/Chicago");
  assert.equal(grouped.length, 2);
  assert.ok(grouped[0].date < grouped[1].date);
  assert.ok(grouped[0].slots[0].timeLabel.length > 0);
});
