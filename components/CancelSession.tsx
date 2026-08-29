"use client";

import { useState } from "react";
import { StatusCard } from "./StatusCard";

type CancelSessionProps = {
  token: string;
  dateLabel: string;
  timeLabel: string;
  alreadyCancelled: boolean;
};

export function CancelSession({
  token,
  dateLabel,
  timeLabel,
  alreadyCancelled,
}: CancelSessionProps) {
  const [state, setState] = useState<"confirming" | "loading" | "done" | "error">(
    alreadyCancelled ? "done" : "confirming"
  );

  async function handleCancel() {
    setState("loading");
    try {
      const res = await fetch(`/api/bookings/${token}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <StatusCard tone="info" title="Booking cancelled">
        Your {dateLabel} at {timeLabel} appointment has been cancelled. The chair is open for
        someone else now -- book again any time.
      </StatusCard>
    );
  }

  if (state === "error") {
    return (
      <StatusCard tone="error" title="Something went wrong">
        We couldn&rsquo;t cancel that booking. Please call the shop and we&rsquo;ll take care of
        it.
      </StatusCard>
    );
  }

  return (
    <div className="card-glass mx-auto max-w-md px-8 py-10 text-center">
      <span className="rule-facet mx-auto mb-5" />
      <h1 className="font-display text-3xl text-cream">Cancel this booking?</h1>
      <p className="mt-4 text-sm text-cream-dim">
        <strong className="text-cream">{dateLabel}</strong> at{" "}
        <strong className="text-cream">{timeLabel}</strong>
      </p>
      <p className="mt-4 text-xs text-cream-dim/70">
        This frees up the chair for someone else. You can always rebook.
      </p>
      <button
        type="button"
        onClick={handleCancel}
        disabled={state === "loading"}
        className="btn-primary mt-7 w-full disabled:opacity-60"
      >
        {state === "loading" ? "Cancelling..." : "Yes, Cancel My Booking"}
      </button>
    </div>
  );
}
