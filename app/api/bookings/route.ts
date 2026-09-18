import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import { isSupabaseConfigured, isStripeConfigured } from "@/lib/env";
import { bookingSchema } from "@/lib/validation";
import { toE164 } from "@/lib/phone";
import { isSlotStillOpen } from "@/lib/open-slots";
import { getSupabaseAdmin, type BookingRow } from "@/lib/supabase";
import { finalizeConfirmedBooking } from "@/lib/booking-actions";
import { createCheckoutSession, paymentAmountCents } from "@/lib/stripe";

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
      payment_status: "unpaid",
      payment_amount_cents: null,
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

  // The row above already holds the slot (unique index on starts_at). If a
  // deposit is required, nothing else happens yet -- no calendar event, no
  // confirmation email/SMS -- until the Stripe webhook confirms it was paid.
  // That keeps an abandoned checkout from looking like a real booking.
  if (isStripeConfigured()) {
    const checkout = await createCheckoutSession(booking);
    if (checkout.status === "created") {
      const { data: updated, error: paymentError } = await supabase
        .from("bookings")
        .update({
          payment_status: "checkout_created",
          payment_amount_cents: paymentAmountCents(booking),
          stripe_checkout_session_id: checkout.sessionId,
        })
        .eq("id", booking.id)
        .select("*")
        .single();

      if (paymentError) {
        console.error("Failed to store Stripe checkout session:", paymentError);
      } else if (updated) {
        booking = updated as BookingRow;
      }

      return NextResponse.json({
        ok: true,
        checkoutUrl: checkout.url,
        booking: {
          id: booking.id,
          startsAt: booking.starts_at,
          endsAt: booking.ends_at,
          actionToken: booking.action_token,
          paymentStatus: booking.payment_status,
        },
      });
    }

    // Stripe hiccuped -- don't strand the customer or the held slot. Fall
    // back to the pay-at-chair flow below so the appointment still confirms.
    console.error(
      "createCheckoutSession failed, falling back to pay-at-chair:",
      checkout.status === "failed" ? checkout.error : "Stripe not configured"
    );
  }

  booking = await finalizeConfirmedBooking(booking);

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      actionToken: booking.action_token,
      paymentStatus: booking.payment_status,
    },
  });
}
