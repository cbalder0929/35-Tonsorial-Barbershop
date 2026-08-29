import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getOpenSlots } from "@/lib/open-slots";
import { availabilityQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false });
  }

  const { searchParams } = new URL(req.url);
  const parsed = availabilityQuerySchema.safeParse({
    from: searchParams.get("from"),
    days: searchParams.get("days") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await getOpenSlots(parsed.data.from, parsed.data.days);
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/availability failed:", err);
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500 }
    );
  }
}
