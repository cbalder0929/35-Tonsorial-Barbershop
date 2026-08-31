import "server-only";
import { addMinutes, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { config } from "./config";
import { getSupabaseAdmin, type BookingRow } from "./supabase";
import { isGoogleConfigured } from "./env";
import { deleteCalendarEvent, updateCalendarEvent } from "./google-calendar";
import { isSlotStillOpen } from "./open-slots";
import {
  sendCancelledEmail,
  sendAdminCancelledNotification,
  sendRescheduledEmail,
  sendAdminRescheduledNotification,
} from "./notifications";

export type ActionResult =
  | { ok: true; alreadyDone: boolean; booking: BookingRow }
  | { ok: false; reason: "not_found" };

export type RescheduleResult =
  | { ok: true; booking: BookingRow }
  | { ok: false; reason: "not_found" | "cancelled" | "slot_taken" };

/** Read-only lookup, used by the confirm/cancel pages to render booking details. */
export async function getBookingByToken(token: string): Promise<BookingRow | null> {
  return findByToken(token);
}

async function findByToken(token: string): Promise<BookingRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("action_token", token)
    .maybeSingle();

  if (error) throw new Error(`Failed to load booking: ${error.message}`);
  return data as BookingRow | null;
}

/** Idempotent -- confirming an already-confirmed booking returns alreadyDone: true. */
export async function confirmBooking(token: string): Promise<ActionResult> {
  const booking = await findByToken(token);
  if (!booking) return { ok: false, reason: "not_found" };

  if (booking.status === "confirmed") {
    return { ok: true, alreadyDone: true, booking };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", booking.id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to confirm booking: ${error.message}`);
  return { ok: true, alreadyDone: false, booking: data as BookingRow };
}

/**
 * Idempotent -- cancels the booking, deletes the calendar event (freeing the
 * slot), and sends the cancellation email. Calendar/email failures are
 * caught and logged; they never block the cancellation itself.
 */
export async function cancelBooking(token: string): Promise<ActionResult> {
  const booking = await findByToken(token);
  if (!booking) return { ok: false, reason: "not_found" };

  if (booking.status === "cancelled") {
    return { ok: true, alreadyDone: true, booking };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", booking.id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to cancel booking: ${error.message}`);
  const updated = data as BookingRow;

  if (updated.google_event_id && isGoogleConfigured()) {
    try {
      await deleteCalendarEvent(updated.google_event_id);
    } catch (err) {
      console.error("deleteCalendarEvent failed:", err);
    }
  }

  try {
    await sendCancelledEmail(updated);
  } catch (err) {
    console.error("sendCancelledEmail failed:", err);
  }

  try {
    await sendAdminCancelledNotification(updated);
  } catch (err) {
    console.error("sendAdminCancelledNotification failed:", err);
  }

  return { ok: true, alreadyDone: false, booking: updated };
}

function dateTimeLabels(booking: BookingRow) {
  const zoned = toZonedTime(new Date(booking.starts_at), config.timezone);
  return {
    dateLabel: format(zoned, "EEEE, MMMM d"),
    timeLabel: format(zoned, "h:mm a"),
  };
}

/**
 * Moves a booking to a new start time in place -- same booking row, same
 * action_token, same google_event_id (updated via PATCH, not delete+recreate).
 */
export async function rescheduleBooking(
  token: string,
  newStartsAtIso: string
): Promise<RescheduleResult> {
  const booking = await findByToken(token);
  if (!booking) return { ok: false, reason: "not_found" };
  if (booking.status === "cancelled") return { ok: false, reason: "cancelled" };

  const stillOpen = await isSlotStillOpen(newStartsAtIso, booking.id);
  if (!stillOpen) return { ok: false, reason: "slot_taken" };

  const { dateLabel: previousDateLabel, timeLabel: previousTimeLabel } =
    dateTimeLabels(booking);

  const newStartsAt = new Date(newStartsAtIso);
  const durationMs = new Date(booking.ends_at).getTime() - new Date(booking.starts_at).getTime();
  const newEndsAt = addMinutes(newStartsAt, durationMs / 60_000);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      starts_at: newStartsAt.toISOString(),
      ends_at: newEndsAt.toISOString(),
    })
    .eq("id", booking.id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to reschedule booking: ${error.message}`);
  const updated = data as BookingRow;

  if (updated.google_event_id && isGoogleConfigured()) {
    try {
      await updateCalendarEvent(updated.google_event_id, {
        startsAt: newStartsAt,
        endsAt: newEndsAt,
      });
    } catch (err) {
      console.error("updateCalendarEvent failed:", err);
    }
  }

  try {
    await sendRescheduledEmail(updated, previousDateLabel, previousTimeLabel);
  } catch (err) {
    console.error("sendRescheduledEmail failed:", err);
  }

  try {
    await sendAdminRescheduledNotification(updated, previousDateLabel, previousTimeLabel);
  } catch (err) {
    console.error("sendAdminRescheduledNotification failed:", err);
  }

  return { ok: true, booking: updated };
}
