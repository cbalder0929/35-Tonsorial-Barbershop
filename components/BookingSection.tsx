"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { config } from "@/lib/config";
import { DatePicker } from "./DatePicker";
import { TimeSlots } from "./TimeSlots";
import { BookingForm, type BookingFormValues } from "./BookingForm";
import { SuccessScreen } from "./SuccessScreen";

type SlotsByDate = {
  date: string;
  dateLabel: string;
  slots: { startsAt: string; timeLabel: string }[];
};

type AvailabilityResponse =
  | { configured: false }
  | { configured: true; days: SlotsByDate[] };

type Step = "loading" | "unconfigured" | "picking" | "form" | "success";

const NO_PREFERENCE = "no-preference";

export function BookingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<Step>("loading");
  const [days, setDays] = useState<SlotsByDate[]>([]);
  const [service, setService] = useState<string>(config.pricing[0]?.id ?? "");
  const [barber, setBarber] = useState<string>(NO_PREFERENCE);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartsAt, setSelectedStartsAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    dateLabel: string;
    timeLabel: string;
    email: string;
  } | null>(null);

  async function loadAvailability() {
    setLoadError(null);
    try {
      const from = format(new Date(), "yyyy-MM-dd");
      const res = await fetch(
        `/api/availability?from=${from}&days=${config.booking.maxAdvanceDays}`
      );
      const data: AvailabilityResponse = await res.json();

      if (!data.configured) {
        setStep("unconfigured");
        return;
      }

      const daysWithSlots = data.days.filter((d) => d.slots.length > 0);
      setDays(daysWithSlots);
      setSelectedDate((prev) => prev ?? daysWithSlots[0]?.date ?? null);
      setStep("picking");
    } catch {
      setLoadError("Couldn't load availability. Please refresh and try again.");
      setStep("picking");
    }
  }

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step === "success") {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const dateOptions = useMemo(
    () => days.map((d) => ({ date: d.date, dateLabel: d.dateLabel, slotCount: d.slots.length })),
    [days]
  );

  const activeDay = days.find((d) => d.date === selectedDate);
  const timeSlots = activeDay?.slots ?? [];
  const selectedServiceName = config.pricing.find((p) => p.id === service)?.name;

  async function handleFormSubmit(values: BookingFormValues) {
    if (!selectedStartsAt) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          goal: selectedServiceName ?? "",
          preferredBarber: barber === NO_PREFERENCE ? "" : barber,
          startsAt: selectedStartsAt,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setSubmitError(data.error ?? "That time was just taken. Please pick another.");
        setSelectedStartsAt(null);
        setStep("picking");
        await loadAvailability();
        return;
      }

      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const slot = timeSlots.find((s) => s.startsAt === selectedStartsAt);
      setConfirmed({
        dateLabel: activeDay?.dateLabel ?? "",
        timeLabel: slot?.timeLabel ?? "",
        email: values.email,
      });
      setStep("success");
    } catch {
      setSubmitError("Network error -- please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="booking" ref={sectionRef} className="section-pad scroll-mt-24">
      <span className="rule-facet mb-5" />
      <h2 className="font-display text-3xl uppercase tracking-wide text-cream sm:text-4xl">
        Book Your Chair
      </h2>

      <div className="mt-8">
        {step === "loading" && (
          <p className="py-10 text-center text-cream-dim">Loading availability...</p>
        )}

        {step === "unconfigured" && (
          <div className="card-glass px-8 py-10 text-center">
            <p className="text-cream-dim">
              Online booking opens shortly. In the meantime, call or text{" "}
              <a href={`tel:${config.business.phone}`} className="text-royal-400">
                {config.business.phoneDisplay}
              </a>{" "}
              to grab a chair.
            </p>
          </div>
        )}

        {(step === "picking" || step === "form") && (
          <div className="card-glass p-5 sm:p-8">
            {loadError && <p className="mb-4 text-sm text-crimson-400">{loadError}</p>}

            <BookingStep label="1. Service">
              <PillGroup
                options={config.pricing.map((p) => ({ value: p.id, label: `${p.name} -- $${p.price}` }))}
                value={service}
                onChange={setService}
              />
            </BookingStep>

            <BookingStep label="2. Barber">
              <PillGroup
                options={[
                  { value: NO_PREFERENCE, label: "No Preference" },
                  ...config.team.map((t) => ({ value: t.id, label: t.name })),
                ]}
                value={barber}
                onChange={setBarber}
              />
            </BookingStep>

            {days.length === 0 ? (
              <p className="py-6 text-center text-cream-dim">
                No open times in the next {config.booking.maxAdvanceDays} days -- check back soon
                or call {config.business.phoneDisplay}.
              </p>
            ) : (
              <>
                <BookingStep label="3. Date">
                  <DatePicker
                    dates={dateOptions}
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedStartsAt(null);
                      setStep("picking");
                    }}
                  />
                </BookingStep>

                <BookingStep label="4. Time">
                  <TimeSlots
                    slots={timeSlots}
                    selectedStartsAt={selectedStartsAt}
                    onSelect={(startsAt) => {
                      setSelectedStartsAt(startsAt);
                      setStep("form");
                      setSubmitError(null);
                    }}
                  />
                </BookingStep>

                {step === "form" && selectedStartsAt && (
                  <div className="mt-8 border-t border-navy-700/80 pt-8">
                    <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-cream-dim">
                      5. Your Info
                    </p>
                    <p className="mb-5 text-sm text-cream-dim">
                      Locking in{" "}
                      <strong className="text-cream">
                        {selectedServiceName} -- {activeDay?.dateLabel} at{" "}
                        {timeSlots.find((s) => s.startsAt === selectedStartsAt)?.timeLabel}
                      </strong>
                    </p>
                    <BookingForm
                      onSubmit={handleFormSubmit}
                      submitting={submitting}
                      submitError={submitError}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === "success" && confirmed && (
          <SuccessScreen
            dateLabel={confirmed.dateLabel}
            timeLabel={confirmed.timeLabel}
            email={confirmed.email}
          />
        )}
      </div>
    </section>
  );
}

function BookingStep({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-cream-dim">
        {label}
      </p>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
              isSelected
                ? "border-transparent bg-crimson-600 text-cream"
                : "border-navy-600 bg-navy-900/60 text-cream-dim hover:border-royal-400/60"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
