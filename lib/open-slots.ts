import "server-only";
import { addDays } from "date-fns";
import { config } from "./config";
import {
  generateSlots,
  removeBusySlots,
  removeBookedSlots,
  removeTooSoonSlots,
  groupSlotsByDate,
  type SlotsByDate,
} from "./availability";
import { isGoogleConfigured, allBusyCalendarIds } from "./env";
import { getBusyIntervals } from "./google-calendar";
import { getSupabaseAdmin } from "./supabase";

export type OpenSlotsResult =
  | { configured: false }
  | { configured: true; days: SlotsByDate[] };

/**
 * The single authority on what is bookable. Called by both the availability
 * endpoint and the booking endpoint's re-check -- they must never diverge.
 *
 * Pipeline: weekly rules -> theoretical slots -> minus Google busy time
 * -> minus existing bookings -> minus slots inside the notice window.
 */
export async function getOpenSlots(
  fromDate: string,
  days: number
): Promise<OpenSlotsResult> {
  const supabase = getSupabaseAdmin();

  let slots = generateSlots({
    fromDate,
    days,
    weeklyRules: config.booking.weeklyRules,
    sessionLengthMinutes: config.booking.sessionLengthMinutes,
    timezone: config.timezone,
  });

  if (slots.length > 0 && isGoogleConfigured()) {
    const timeMin = slots[0].startsAt;
    const timeMax = addDays(slots[slots.length - 1].endsAt, 1);
    try {
      const busy = await getBusyIntervals(allBusyCalendarIds(), timeMin, timeMax);
      slots = removeBusySlots(slots, busy);
    } catch (err) {
      console.error("getBusyIntervals failed, continuing without it:", err);
    }
  }

  const rangeStart = slots[0]?.startsAt ?? new Date();
  const rangeEnd = addDays(rangeStart, days + 1);

  const { data: booked, error } = await supabase
    .from("bookings")
    .select("starts_at")
    .in("status", ["booked", "confirmed"])
    .gte("starts_at", rangeStart.toISOString())
    .lte("starts_at", rangeEnd.toISOString());

  if (error) {
    throw new Error(`Failed to load existing bookings: ${error.message}`);
  }

  const bookedStarts = (booked ?? []).map((row) => new Date(row.starts_at));
  slots = removeBookedSlots(slots, bookedStarts);
  slots = removeTooSoonSlots(slots, new Date(), config.booking.minNoticeHours);

  return { configured: true, days: groupSlotsByDate(slots, config.timezone) };
}

/** Re-checks a single slot is still open -- used just before INSERT. */
export async function isSlotStillOpen(startsAtIso: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("starts_at", startsAtIso)
    .in("status", ["booked", "confirmed"])
    .limit(1);

  if (error) {
    throw new Error(`Failed to re-check slot: ${error.message}`);
  }
  return (data ?? []).length === 0;
}
