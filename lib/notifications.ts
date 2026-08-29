import "server-only";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { config } from "./config";
import { env } from "./env";
import { sendEmail } from "./email";
import { generateIcs } from "./ics";
import { getSupabaseAdmin, type BookingRow } from "./supabase";
import { confirmationEmail } from "@/emails/confirmation";
import { adminNotificationEmail } from "@/emails/admin-notification";
import { reminderEmail } from "@/emails/reminder";
import { cancelledEmail } from "@/emails/cancelled";

function labels(booking: BookingRow) {
  const zoned = toZonedTime(new Date(booking.starts_at), config.timezone);
  return {
    dateLabel: format(zoned, "EEE, MMM d"),
    timeLabel: format(zoned, "h:mm a"),
  };
}

function urls(booking: BookingRow) {
  const base = env.siteUrl;
  return {
    confirmUrl: `${base}/confirmed/${booking.action_token}`,
    cancelUrl: `${base}/cancel/${booking.action_token}`,
    bookAgainUrl: base,
  };
}

async function logMessage(input: {
  bookingId: string;
  channel: "email" | "sms";
  kind: string;
  providerId?: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
}) {
  const supabase = getSupabaseAdmin();
  await supabase.from("message_log").insert({
    booking_id: input.bookingId,
    channel: input.channel,
    kind: input.kind,
    provider_id: input.providerId ?? null,
    status: input.status,
    error: input.error ?? null,
    sent_at: new Date().toISOString(),
  });
}

/** Sends the immediate confirmation email with .ics attachment. Best-effort. */
export async function sendConfirmationEmail(booking: BookingRow): Promise<void> {
  const { dateLabel, timeLabel } = labels(booking);
  const { confirmUrl, cancelUrl } = urls(booking);

  const { subject, html } = confirmationEmail({
    firstName: booking.first_name,
    dateLabel,
    timeLabel,
    confirmUrl,
    cancelUrl,
  });

  const ics = generateIcs({
    uid: `${booking.id}@35thtonsorial.com`,
    startsAt: new Date(booking.starts_at),
    endsAt: new Date(booking.ends_at),
    summary: `${config.business.shortName} -- Appointment`,
    description: `Booking at ${config.business.name}. Manage: ${cancelUrl}`,
    location: `${config.business.address.line1}, ${config.business.address.line2}`,
  });

  const result = await sendEmail({
    to: booking.email,
    subject,
    html,
    attachments: [
      { filename: "appointment.ics", content: Buffer.from(ics).toString("base64") },
    ],
  });

  await logMessage({
    bookingId: booking.id,
    channel: "email",
    kind: "confirmation",
    status: result.status,
    providerId: result.status === "sent" ? result.providerId : undefined,
    error: result.status === "failed" ? result.error : undefined,
  });
}

/** Sends the "new booking" alert to the shop owner. Best-effort. */
export async function sendAdminNotification(booking: BookingRow): Promise<void> {
  const { dateLabel, timeLabel } = labels(booking);
  const { subject, html } = adminNotificationEmail({
    firstName: booking.first_name,
    lastName: booking.last_name,
    email: booking.email,
    phoneDisplay: booking.phone,
    dateLabel,
    timeLabel,
    goal: booking.goal,
    preferredBarber: booking.preferred_barber,
    notes: booking.notes,
  });

  const result = await sendEmail({ to: config.business.email, subject, html });

  await logMessage({
    bookingId: booking.id,
    channel: "email",
    kind: "admin_notification",
    status: result.status,
    providerId: result.status === "sent" ? result.providerId : undefined,
    error: result.status === "failed" ? result.error : undefined,
  });
}

/** Sends a 24h / 2h / 1h reminder. Best-effort, called from the cron route. */
export async function sendReminderEmail(
  booking: BookingRow,
  windowLabel: "24h" | "2h" | "1h"
): Promise<void> {
  const { dateLabel, timeLabel } = labels(booking);
  const { confirmUrl, cancelUrl } = urls(booking);

  const { subject, html } = reminderEmail({
    firstName: booking.first_name,
    dateLabel,
    timeLabel,
    window: windowLabel,
    confirmUrl,
    cancelUrl,
  });

  const result = await sendEmail({ to: booking.email, subject, html });

  await logMessage({
    bookingId: booking.id,
    channel: "email",
    kind: `reminder_${windowLabel}`,
    status: result.status,
    providerId: result.status === "sent" ? result.providerId : undefined,
    error: result.status === "failed" ? result.error : undefined,
  });
}

/** Sends the cancellation acknowledgement. Best-effort. */
export async function sendCancelledEmail(booking: BookingRow): Promise<void> {
  const { dateLabel, timeLabel } = labels(booking);
  const { bookAgainUrl } = urls(booking);

  const { subject, html } = cancelledEmail({
    firstName: booking.first_name,
    dateLabel,
    timeLabel,
    bookAgainUrl,
  });

  const result = await sendEmail({ to: booking.email, subject, html });

  await logMessage({
    bookingId: booking.id,
    channel: "email",
    kind: "cancelled",
    status: result.status,
    providerId: result.status === "sent" ? result.providerId : undefined,
    error: result.status === "failed" ? result.error : undefined,
  });
}
