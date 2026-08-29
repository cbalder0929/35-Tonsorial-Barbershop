import "server-only";
import { getSupabaseAdmin, type BookingRow } from "./supabase";
import { isGoogleConfigured } from "./env";
import { deleteCalendarEvent } from "./google-calendar";
import { sendCancelledEmail } from "./notifications";

export type ActionResult =
  | { ok: true; alreadyDone: boolean; booking: BookingRow }
  | { ok: false; reason: "not_found" };

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

  if (booking.status === "confirmed" || booking.confirmed_at) {
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

  if (booking.status === "cancelled" || booking.cancelled_at) {
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

  return { ok: true, alreadyDone: false, booking: updated };
}
