import { NextRequest, NextResponse } from "next/server";
import { rescheduleBooking } from "@/lib/booking-actions";
import { rescheduleSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await rescheduleBooking(token, parsed.data.startsAt);
    if (!result.ok) {
      if (result.reason === "slot_taken") {
        return NextResponse.json(
          { error: "That time was just taken. Please pick another." },
          { status: 409 }
        );
      }
      if (result.reason === "cancelled") {
        return NextResponse.json(
          { error: "This booking is cancelled and can't be rescheduled." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      booking: {
        startsAt: result.booking.starts_at,
        endsAt: result.booking.ends_at,
      },
    });
  } catch (err) {
    console.error("POST /api/bookings/[token]/reschedule failed:", err);
    return NextResponse.json({ error: "Failed to reschedule booking" }, { status: 500 });
  }
}
