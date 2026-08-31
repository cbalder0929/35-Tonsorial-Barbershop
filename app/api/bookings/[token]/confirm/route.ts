import { NextRequest, NextResponse } from "next/server";
import { confirmBooking } from "@/lib/booking-actions";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await confirmBooking(token);
    if (!result.ok) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      alreadyDone: result.alreadyDone,
      status: result.booking.status,
    });
  } catch (err) {
    console.error("POST /api/bookings/[token]/confirm failed:", err);
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}
