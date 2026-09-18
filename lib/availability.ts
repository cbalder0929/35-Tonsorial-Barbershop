// Pure slot generation. No database, no network, no hidden `new Date()`.
// Everything arrives as an argument -- this is what makes timezone and DST
// tests possible. The availability endpoint and the booking/reschedule
// re-checks all go through open-slots.ts, which wraps generateSlots() below.

import { addDays, addMinutes, format, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { WeeklyRule } from "./config";

export type SlotInterval = {
  /** UTC instant */
  startsAt: Date;
  /** UTC instant */
  endsAt: Date;
};

export type BusyInterval = {
  start: Date;
  end: Date;
};

export type GenerateSlotsArgs = {
  /** Local calendar date (YYYY-MM-DD) to start from, in `timezone` */
  fromDate: string;
  /** How many calendar days forward to generate, inclusive of fromDate */
  days: number;
  weeklyRules: readonly WeeklyRule[];
  sessionLengthMinutes: number;
  timezone: string;
};

/**
 * Generates every theoretical slot in the date range from the weekly rules.
 * Pure: takes fromDate as a string instead of calling new Date(), so tests
 * can pin any starting point (including DST transition days) deterministically.
 */
export function generateSlots(args: GenerateSlotsArgs): SlotInterval[] {
  const { fromDate, days, weeklyRules, sessionLengthMinutes, timezone } = args;
  const slots: SlotInterval[] = [];

  const [y, m, d] = fromDate.split("-").map(Number);
  const startLocalMidnight = new Date(y, m - 1, d);

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const localDay = addDays(startLocalMidnight, dayOffset);
    const dayOfWeek = localDay.getDay();
    const dateStr = format(localDay, "yyyy-MM-dd");

    const rulesForDay = weeklyRules.filter((r) => r.dayOfWeek === dayOfWeek);

    for (const rule of rulesForDay) {
      let cursor = fromZonedTime(`${dateStr}T${rule.startTime}:00`, timezone);
      const dayEnd = fromZonedTime(`${dateStr}T${rule.endTime}:00`, timezone);

      while (isBefore(addMinutes(cursor, sessionLengthMinutes), dayEnd) ||
        addMinutes(cursor, sessionLengthMinutes).getTime() === dayEnd.getTime()) {
        const slotEnd = addMinutes(cursor, sessionLengthMinutes);
        slots.push({ startsAt: cursor, endsAt: slotEnd });
        cursor = slotEnd;
      }
    }
  }

  return slots;
}

/** Removes slots that overlap any busy interval (Google Calendar freeBusy). */
export function removeBusySlots(
  slots: SlotInterval[],
  busy: BusyInterval[]
): SlotInterval[] {
  if (busy.length === 0) return slots;
  return slots.filter((slot) => {
    return !busy.some(
      (b) => slot.startsAt < b.end && slot.endsAt > b.start
    );
  });
}

/** Removes slots that already have a booked/confirmed row (by start time). */
export function removeBookedSlots(
  slots: SlotInterval[],
  bookedStartTimes: Date[]
): SlotInterval[] {
  if (bookedStartTimes.length === 0) return slots;
  const bookedSet = new Set(bookedStartTimes.map((d) => d.getTime()));
  return slots.filter((slot) => !bookedSet.has(slot.startsAt.getTime()));
}

/** Removes slots less than minNoticeHours away from `now`. */
export function removeTooSoonSlots(
  slots: SlotInterval[],
  now: Date,
  minNoticeHours: number
): SlotInterval[] {
  const cutoff = addMinutes(now, minNoticeHours * 60);
  return slots.filter((slot) => slot.startsAt >= cutoff);
}

export type SlotsByDate = {
  date: string; // YYYY-MM-DD in business timezone
  dateLabel: string; // e.g. "Tue, Jul 25"
  slots: {
    startsAt: string; // ISO UTC
    timeLabel: string; // e.g. "9:00 AM"
  }[];
};

/** Groups UTC slot intervals by local calendar date with display labels. */
export function groupSlotsByDate(
  slots: SlotInterval[],
  timezone: string
): SlotsByDate[] {
  const byDate = new Map<string, SlotsByDate>();

  for (const slot of slots) {
    const zoned = toZonedTime(slot.startsAt, timezone);
    const date = format(zoned, "yyyy-MM-dd");
    const dateLabel = format(zoned, "EEE, MMM d");
    const timeLabel = format(zoned, "h:mm a");

    if (!byDate.has(date)) {
      byDate.set(date, { date, dateLabel, slots: [] });
    }
    byDate.get(date)!.slots.push({
      startsAt: slot.startsAt.toISOString(),
      timeLabel,
    });
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}
