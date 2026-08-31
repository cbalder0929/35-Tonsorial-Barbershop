"use client";

import { useState } from "react";
import { format } from "date-fns";
import { config } from "@/lib/config";
import { StatusCard } from "./StatusCard";
import { DatePicker } from "./DatePicker";
import { TimeSlots } from "./TimeSlots";

type SlotsByDate = {
  date: string;
  dateLabel: string;
  slots: { startsAt: string; timeLabel: string }[];
};

type AvailabilityResponse =
  | { configured: false }
  | { configured: true; days: SlotsByDate[] };

type CancelSessionProps = {
  token: string;
  dateLabel: string;
  timeLabel: string;
  alreadyCancelled: boolean;
};

type State = "confirming" | "loading" | "done" | "error" | "rescheduling" | "rescheduled";

export function CancelSession({
  token,
  dateLabel,
  timeLabel,
  alreadyCancelled,
}: CancelSessionProps) {
  const [state, setState] = useState<State>(alreadyCancelled ? "done" : "confirming");
  const [days, setDays] = useState<SlotsByDate[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newLabel, setNewLabel] = useState<{ dateLabel: string; timeLabel: string } | null>(null);

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

  async function openReschedule() {
    setState("rescheduling");
    setRescheduleError(null);
    if (days.length > 0) return;
    setLoadingSlots(true);
    try {
      const from = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(
        `/api/availability?from=${from}&days=${config.booking.maxAdvanceDays}`
      );
      const data: AvailabilityResponse = await res.json();
      if (!data.configured) {
        setRescheduleError("Rescheduling isn't available right now. Please call the shop.");
        return;
      }
      const daysWithSlots = data.days.filter((d) => d.slots.length > 0);
      setDays(daysWithSlots);
      setSelectedDate(daysWithSlots[0]?.date ?? null);
    } catch {
      setRescheduleError("Couldn't load open times. Please try again.");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function confirmReschedule() {
    if (!selectedStartsAt) return;
    setSubmitting(true);
    setRescheduleError(null);
    try {
      const res = await fetch(`/api/bookings/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt: selectedStartsAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRescheduleError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      const activeDay = days.find((d) => d.date === selectedDate);
      const slot = activeDay?.slots.find((s) => s.startsAt === selectedStartsAt);
      setNewLabel({
        dateLabel: activeDay?.dateLabel ?? "",
        timeLabel: slot?.timeLabel ?? "",
      });
      setState("rescheduled");
    } catch {
      setRescheduleError("Network error -- please try again.");
    } finally {
      setSubmitting(false);
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

  if (state === "rescheduled" && newLabel) {
    return (
      <StatusCard tone="success" title="Booking rescheduled">
        You&rsquo;re moved to{" "}
        <strong className="text-cream">
          {newLabel.dateLabel} at {newLabel.timeLabel}
        </strong>
        . A confirmation email is on its way.
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

  if (state === "rescheduling") {
    const activeDay = days.find((d) => d.date === selectedDate);
    const timeSlots = activeDay?.slots ?? [];

    return (
      <div className="card-glass mx-auto max-w-md px-6 py-8 sm:px-8 sm:py-10">
        <span className="rule-facet mx-auto mb-5" />
        <h1 className="text-center font-display text-3xl text-cream">Pick a new time</h1>
        <p className="mt-2 text-center text-xs text-cream-dim/70">
          Currently <strong className="text-cream">{dateLabel}</strong> at{" "}
          <strong className="text-cream">{timeLabel}</strong>
        </p>

        {rescheduleError && (
          <p className="mt-4 text-center text-sm text-crimson-400">{rescheduleError}</p>
        )}

        {loadingSlots ? (
          <p className="py-10 text-center text-cream-dim">Loading open times...</p>
        ) : days.length === 0 ? (
          !rescheduleError && (
            <p className="py-6 text-center text-cream-dim">
              No open times in the next {config.booking.maxAdvanceDays} days -- check back soon
              or call {config.business.phoneDisplay}.
            </p>
          )
        ) : (
          <>
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream-dim">
                Date
              </p>
              <DatePicker
                dates={days.map((d) => ({
                  date: d.date,
                  dateLabel: d.dateLabel,
                  slotCount: d.slots.length,
                }))}
                selectedDate={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedStartsAt(null);
                }}
              />
            </div>

            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream-dim">
                Time
              </p>
              <TimeSlots
                slots={timeSlots}
                selectedStartsAt={selectedStartsAt}
                onSelect={setSelectedStartsAt}
              />
            </div>

            <button
              type="button"
              onClick={confirmReschedule}
              disabled={!selectedStartsAt || submitting}
              className="btn-primary mt-7 w-full disabled:opacity-60"
            >
              {submitting ? "Rescheduling..." : "Confirm New Time"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setState("confirming")}
          className="mt-4 w-full text-center text-sm text-cream-dim hover:text-cream"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="card-glass mx-auto max-w-md px-8 py-10 text-center">
      <span className="rule-facet mx-auto mb-5" />
      <h1 className="font-display text-3xl text-cream">Manage this booking</h1>
      <p className="mt-4 text-sm text-cream-dim">
        <strong className="text-cream">{dateLabel}</strong> at{" "}
        <strong className="text-cream">{timeLabel}</strong>
      </p>

      <button
        type="button"
        onClick={openReschedule}
        className="btn-secondary mt-7 w-full"
      >
        Reschedule
      </button>

      <p className="mt-5 text-xs text-cream-dim/70">
        Or, if you can&rsquo;t make it at all, this frees up the chair for someone else. You can
        always rebook.
      </p>
      <button
        type="button"
        onClick={handleCancel}
        disabled={state === "loading"}
        className="btn-primary mt-3 w-full disabled:opacity-60"
      >
        {state === "loading" ? "Cancelling..." : "Yes, Cancel My Booking"}
      </button>
    </div>
  );
}
