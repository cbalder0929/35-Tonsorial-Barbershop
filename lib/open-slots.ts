import "server-only";
import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { config } from "./config";
import {
  generateSlots,
  removeBusySlots,
  removeBookedSlots,
  removeTooSoonSlots,
  groupSlotsByDate,
  type SlotInterval,
  type SlotsByDate,
} from "./availability";
import { isGoogleConfigured, allBusyCalendarIds } from "./env";
import { getBusyIntervals } from "./google-calendar";
import { getSupabaseAdmin } from "./supabase";

export type OpenSlotsResult =
  | { configured: false }
  | { configured: true; days: SlotsByDate[] };

/**
 * The single authority on what is bookable. The availability endpoint
 * (getOpenSlots) and the booking/reschedule re-check (isSlotStillOpen) both
 * go through here -- they must never diverge.
 *
 * Pipeline: weekly rules -> theoretical slots -> minus Google busy time
 * -> minus existing bookings -> minus slots inside the notice window.
 */
async function computeOpenSlots(
  fromDate: string,
  days: number,
  excludeBookingId?: string
): Promise<SlotInterval[]> {
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

  let query = supabase
    .from("bookings")
    .select("starts_at")
    .in("status", ["booked", "confirmed"])
    .gte("starts_at", rangeStart.toISOString())
    .lte("starts_at", rangeEnd.toISOString());

  if (excludeBookingId) {
    query = query.neq("id", excludeBookingId);
  }

  const { data: booked, error } = await query;

  if (error) {
    throw new Error(`Failed to load existing bookings: ${error.message}`);
  }

  const bookedStarts = (booked ?? []).map((row) => new Date(row.starts_at));
  slots = removeBookedSlots(slots, bookedStarts);
  slots = removeTooSoonSlots(slots, new Date(), config.booking.minNoticeHours);

  return slots;
}

export async function getOpenSlots(
  fromDate: string,
  days: number
): Promise<OpenSlotsResult> {
  const slots = await computeOpenSlots(fromDate, days);
  return { configured: true, days: groupSlotsByDate(slots, config.timezone) };
}

/**
 * Re-checks a single start time is still bookable -- used just before
 * INSERT, and before rescheduling (where excludeBookingId lets a booking
 * ignore its own row while checking the new time). Rejects anything the
 * availability endpoint wouldn't offer: outside opening hours, off the slot
 * grid, blocked on Google Calendar, already booked, or too soon.
 */
export async function isSlotStillOpen(
  startsAtIso: string,
  excludeBookingId?: string
): Promise<boolean> {
  const startsAt = new Date(startsAtIso);
  const localDate = format(toZonedTime(startsAt, config.timezone), "yyyy-MM-dd");
  const slots = await computeOpenSlots(localDate, 1, excludeBookingId);
  return slots.some((slot) => slot.startsAt.getTime() === startsAt.getTime());
}
