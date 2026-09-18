import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, type BookingRow } from "@/lib/supabase";
import { verifyStripeWebhook } from "@/lib/stripe";
import { finalizeConfirmedBooking } from "@/lib/booking-actions";

export const dynamic = "force-dynamic";

async function findBookingById(bookingId: string): Promise<BookingRow | null> {
  const { data } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  return data as BookingRow | null;
}

export async function POST(req: NextRequest) {
  // Must read the raw body before any JSON parsing -- Stripe's signature is
  // computed over the exact bytes it sent, and req.json() would consume them.
  const rawBody = await req.text();
  let event;

  try {
    event = verifyStripeWebhook(rawBody, req.headers.get("stripe-signature"));
  } catch (err) {
    console.error("Stripe webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      const current = await findBookingById(bookingId);

      // Idempotent -- Stripe retries webhook deliveries, and this must never
      // send a second confirmation email/SMS or create a second calendar event.
      if (current && current.payment_status !== "paid") {
        const { data: updated, error } = await getSupabaseAdmin()
          .from("bookings")
          .update({
            payment_status: "paid",
            payment_amount_cents: session.amount_total ?? current.payment_amount_cents,
            stripe_checkout_session_id: session.id ?? current.stripe_checkout_session_id,
            stripe_payment_intent_id: session.payment_intent ?? null,
          })
          .eq("id", bookingId)
          .select("*")
          .single();

        if (error) {
          console.error("Failed to mark booking paid:", error);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }

        try {
          await finalizeConfirmedBooking(updated as BookingRow);
        } catch (err) {
          console.error("finalizeConfirmedBooking failed:", err);
        }
      }
    }
  }

  // Customer closed the checkout tab, or the payment ultimately failed --
  // either way the deposit was never collected, so release the held slot
  // instead of blocking it for everyone else.
  if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      const current = await findBookingById(bookingId);

      if (current && current.payment_status !== "paid" && current.status !== "cancelled") {
        const { error } = await getSupabaseAdmin()
          .from("bookings")
          .update({
            payment_status: "failed",
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            stripe_checkout_session_id: session.id ?? current.stripe_checkout_session_id,
          })
          .eq("id", bookingId);

        if (error) {
          console.error("Failed to release unpaid booking:", error);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
