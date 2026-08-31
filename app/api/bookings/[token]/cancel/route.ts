import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/lib/booking-actions";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await cancelBooking(token);
    if (!result.ok) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      alreadyDone: result.alreadyDone,
      status: result.booking.status,
    });
  } catch (err) {
    console.error("POST /api/bookings/[token]/cancel failed:", err);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
