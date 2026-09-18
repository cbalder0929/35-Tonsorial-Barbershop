import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Footer } from "@/components/Footer";
import { StatusCard } from "@/components/StatusCard";
import { config } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseAdmin, type BookingRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: `Payment Received | ${config.business.name}` };

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!isSupabaseConfigured() || !sessionId) {
    return (
      <main>
        <StatusCard tone="error" title="Payment lookup unavailable">
          <p>Please check your email confirmation or contact {config.business.phoneDisplay}.</p>
        </StatusCard>
        <Footer />
      </main>
    );
  }

  const { data } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  const booking = data as BookingRow | null;
  if (!booking) {
    return (
      <main>
        <StatusCard tone="error" title="Booking not found">
          <p>Please check your email confirmation or contact {config.business.phoneDisplay}.</p>
        </StatusCard>
        <Footer />
      </main>
    );
  }

  const zoned = toZonedTime(new Date(booking.starts_at), config.timezone);
  const dateLabel = format(zoned, "EEEE, MMMM d");
  const timeLabel = format(zoned, "h:mm a");

  return (
    <main>
      <StatusCard tone="success" title="Payment received">
        <p>
          You are paid and booked for <strong className="text-cream">{dateLabel}</strong> at{" "}
          <strong className="text-cream">{timeLabel}</strong>.
        </p>
        <p className="mt-3">
          Your confirmation email has the appointment details and manage-booking links.
        </p>
      </StatusCard>
      <Footer />
    </main>
  );
}
