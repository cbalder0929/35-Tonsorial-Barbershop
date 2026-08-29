import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSupabaseAdmin, type BookingRow } from "@/lib/supabase";
import { sendReminderEmail } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type Window = {
  label: "24h" | "2h" | "1h";
  minHoursAway: number;
  maxHoursAway: number;
  sentColumn: "reminder_24h_sent_at" | "reminder_2h_sent_at" | "reminder_1h_sent_at";
};

const WINDOWS: Window[] = [
  { label: "24h", minHoursAway: 23, maxHoursAway: 25, sentColumn: "reminder_24h_sent_at" },
  { label: "2h", minHoursAway: 1.5, maxHoursAway: 2.5, sentColumn: "reminder_2h_sent_at" },
  { label: "1h", minHoursAway: 0.5, maxHoursAway: 1.5, sentColumn: "reminder_1h_sent_at" },
];

async function processWindow(win: Window, now: Date) {
  const supabase = getSupabaseAdmin();
  const rangeStart = addHours(now, win.minHoursAway).toISOString();
  const rangeEnd = addHours(now, win.maxHoursAway).toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["booked", "confirmed"])
    .is(win.sentColumn, null)
    .gte("starts_at", rangeStart)
    .lte("starts_at", rangeEnd);

  if (error) throw new Error(`Failed to query ${win.label} window: ${error.message}`);

  const bookings = (data ?? []) as BookingRow[];
  let sent = 0;

  for (const booking of bookings) {
    // Stamp before sending -- if the cron retries, nobody gets a duplicate.
    const { error: stampError } = await supabase
      .from("bookings")
      .update({ [win.sentColumn]: new Date().toISOString() })
      .eq("id", booking.id)
      .is(win.sentColumn, null);

    if (stampError) {
      console.error(`Failed to stamp ${win.sentColumn} for ${booking.id}:`, stampError);
      continue;
    }

    try {
      await sendReminderEmail(booking, win.label);
      sent++;
    } catch (err) {
      console.error(`sendReminderEmail failed for ${booking.id}:`, err);
    }
  }

  return sent;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!env.cronSecret || auth !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: Record<string, number> = {};

  try {
    for (const win of WINDOWS) {
      results[win.label] = await processWindow(win, now);
    }
    return NextResponse.json({ ok: true, sent: results });
  } catch (err) {
    console.error("POST /api/cron/reminders failed:", err);
    return NextResponse.json({ error: "Reminder cron failed" }, { status: 500 });
  }
}
