import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "./env";

let cachedClient: SupabaseClient | null = null;

/** Service-role Supabase client. Server-only -- never import from a "use client" file. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  if (cachedClient) return cachedClient;

  cachedClient = createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

export type BookingRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  goal: string | null;
  preferred_barber: string | null;
  notes: string | null;
  sms_consent: boolean;
  consent_ip: string | null;
  consent_at: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: "booked" | "confirmed" | "completed" | "cancelled" | "no_show";
  google_event_id: string | null;
  payment_status: "unpaid" | "checkout_created" | "paid" | "failed" | "refunded";
  payment_amount_cents: number | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  reminder_24h_sent_at: string | null;
  reminder_1h_sent_at: string | null;
  reminder_2h_sent_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  action_token: string;
};
