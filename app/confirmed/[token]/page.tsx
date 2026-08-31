import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { config } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/env";
import { confirmBooking } from "@/lib/booking-actions";
import { StatusCard } from "@/components/StatusCard";

export const dynamic = "force-dynamic";

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <Shell>
        <StatusCard tone="error" title="Booking system unavailable">
          Please contact the shop directly.
        </StatusCard>
      </Shell>
    );
  }

  const { token } = await params;
  const result = await confirmBooking(token);

  if (!result.ok) {
    return (
      <Shell>
        <StatusCard tone="error" title="Booking not found">
          This confirmation link isn&rsquo;t valid. Double-check the email, or call{" "}
          {config.business.phoneDisplay}.
        </StatusCard>
      </Shell>
    );
  }

  const zoned = toZonedTime(new Date(result.booking.starts_at), config.timezone);
  const dateLabel = format(zoned, "EEEE, MMMM d");
  const timeLabel = format(zoned, "h:mm a");

  return (
    <Shell>
      <StatusCard tone="success" title="You're confirmed!">
        <p>
          <strong className="text-cream">{dateLabel}</strong> at{" "}
          <strong className="text-cream">{timeLabel}</strong>
        </p>
        <p className="mt-3 text-xs text-cream-dim/70">
          {config.business.address.line1}, {config.business.address.line2}
        </p>
      </StatusCard>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      {children}
    </main>
  );
}
