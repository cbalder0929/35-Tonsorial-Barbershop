import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { config } from "./config";
import { env, isStripeConfigured } from "./env";
import type { BookingRow } from "./supabase";

const STRIPE_API = "https://api.stripe.com/v1";

export type StripeCheckoutResult =
  | { status: "created"; sessionId: string; url: string }
  | { status: "skipped"; error?: string }
  | { status: "failed"; error: string };

export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      payment_intent?: string;
      payment_status?: string;
      amount_total?: number;
      metadata?: Record<string, string | undefined>;
    };
  };
};

function serviceForBooking(booking: BookingRow) {
  return config.pricing.find((item) => item.name === booking.goal) ?? config.pricing[0];
}

/** Deposit amount for a booking's service -- config.booking.depositPercent of the listed price. */
export function paymentAmountCents(booking: BookingRow): number {
  const service = serviceForBooking(booking);
  return Math.round(service.price * config.booking.depositPercent * 100);
}

// Stripe requires expires_at between 30 minutes and 24 hours from creation.
// Bounds how long an unpaid booking can hold its slot before the webhook
// (checkout.session.expired) releases it back to availability.
const CHECKOUT_EXPIRY_SECONDS = 30 * 60;

export async function createCheckoutSession(booking: BookingRow): Promise<StripeCheckoutResult> {
  if (!isStripeConfigured()) {
    return { status: "skipped", error: "Stripe is not configured" };
  }

  const service = serviceForBooking(booking);
  const amountCents = paymentAmountCents(booking);
  const depositPct = Math.round(config.booking.depositPercent * 100);
  const fullName = `${booking.first_name} ${booking.last_name}`;
  const params = new URLSearchParams({
    mode: "payment",
    expires_at: String(Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRY_SECONDS),
    success_url: `${env.siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}/payment/cancelled`,
    customer_email: booking.email,
    "client_reference_id": booking.id,
    "metadata[booking_id]": booking.id,
    "metadata[action_token]": booking.action_token,
    "payment_intent_data[metadata][booking_id]": booking.id,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(amountCents),
    "line_items[0][price_data][product_data][name]": `${config.business.shortName} - ${service.name} (${depositPct}% deposit)`,
    "line_items[0][price_data][product_data][description]": `Non-refundable deposit for ${fullName}'s appointment. Remaining balance due at the chair.`,
  });

  try {
    const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = json?.error?.message ? String(json.error.message) : "Stripe request failed";
      return { status: "failed", error: `${res.status} ${message}` };
    }

    if (!json?.id || !json?.url) {
      return { status: "failed", error: "Stripe response did not include a checkout URL" };
    }

    return { status: "created", sessionId: String(json.id), url: String(json.url) };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown Stripe error",
    };
  }
}

export function verifyStripeWebhook(rawBody: string, signature: string | null): StripeWebhookEvent {
  if (!env.stripeWebhookSecret) {
    throw new Error("Stripe webhook secret is not configured");
  }
  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) {
    throw new Error("Invalid Stripe signature header");
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const actual = createHmac("sha256", env.stripeWebhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid Stripe signature");
  }

  return JSON.parse(rawBody) as StripeWebhookEvent;
}
