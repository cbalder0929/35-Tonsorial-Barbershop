import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isSupabaseConfigured, isGoogleConfigured } from "@/lib/env";
import { bookingSchema } from "@/lib/validation";
import { toE164 } from "@/lib/phone";
import { isSlotStillOpen } from "@/lib/open-slots";
import { getSupabaseAdmin, type BookingRow } from "@/lib/supabase";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Booking is not available right now" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // Honeypot: bots fill hidden fields. Accept silently, save nothing.
  if (input.honeypot) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const phone = toE164(input.phone);
  const startsAt = new Date(input.startsAt);
  const endsAt = addMinutes(startsAt, config.booking.sessionLengthMinutes);

  const stillOpen = await isSlotStillOpen(startsAt.toISOString());
  if (!stillOpen) {
    return NextResponse.json(
      { error: "That time was just taken. Please pick another." },
      { status: 409 }
    );
  }

  const supabase = getSupabaseAdmin();
  const actionToken = randomBytes(16).toString("hex");

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone,
      goal: input.goal || null,
      preferred_barber: input.preferredBarber || null,
      notes: input.notes || null,
      sms_consent: input.smsConsent,
      consent_ip: clientIp(req),
      consent_at: new Date().toISOString(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      timezone: config.timezone,
      status: "booked",
      action_token: actionToken,
    })
    .select("*")
    .single();

  if (error) {
    // Unique partial index on starts_at -- the DB-level race condition guard.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That time was just taken. Please pick another." },
        { status: 409 }
      );
    }
    console.error("Insert booking failed:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }

  let booking = data as BookingRow;

  // Steps below are best-effort: failures are logged, never fail the booking.
  if (isGoogleConfigured()) {
    try {
      const eventId = await createCalendarEvent({
        summary: `${config.business.shortName} -- ${booking.first_name} ${booking.last_name}`,
        description: [
          `Service: ${booking.goal ?? "n/a"}`,
          `Preferred barber: ${booking.preferred_barber ?? "no preference"}`,
          booking.notes ? `Notes: ${booking.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        location: `${config.business.address.line1}, ${config.business.address.line2}`,
        startsAt,
        endsAt,
        attendeeEmail: booking.email,
        attendeeName: `${booking.first_name} ${booking.last_name}`,
      });

      const { data: updated } = await supabase
        .from("bookings")
        .update({ google_event_id: eventId })
        .eq("id", booking.id)
        .select("*")
        .single();
      if (updated) booking = updated as BookingRow;
    } catch (err) {
      console.error("createCalendarEvent failed:", err);
    }
  }

  try {
    await sendConfirmationEmail(booking);
  } catch (err) {
    console.error("sendConfirmationEmail failed:", err);
  }

  try {
    await sendAdminNotification(booking);
  } catch (err) {
    console.error("sendAdminNotification failed:", err);
  }

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      actionToken: booking.action_token,
    },
  });
}
