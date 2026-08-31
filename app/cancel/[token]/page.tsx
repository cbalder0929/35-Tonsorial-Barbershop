import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { config } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/env";
import { getBookingByToken } from "@/lib/booking-actions";
import { StatusCard } from "@/components/StatusCard";
import { CancelSession } from "@/components/CancelSession";

export const dynamic = "force-dynamic";

export default async function CancelPage({
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
  const booking = await getBookingByToken(token);

  if (!booking) {
    return (
      <Shell>
        <StatusCard tone="error" title="Booking not found">
          This link isn&rsquo;t valid. Double-check the email, or call{" "}
          {config.business.phoneDisplay}.
        </StatusCard>
      </Shell>
    );
  }

  const zoned = toZonedTime(new Date(booking.starts_at), config.timezone);
  const dateLabel = format(zoned, "EEEE, MMMM d");
  const timeLabel = format(zoned, "h:mm a");

  return (
    <Shell>
      <CancelSession
        token={token}
        dateLabel={dateLabel}
        timeLabel={timeLabel}
        alreadyCancelled={booking.status === "cancelled"}
      />
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
