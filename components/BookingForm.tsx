"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { bookingSchema } from "@/lib/validation";
import { formatAsYouType } from "@/lib/phone";

// Service and barber are chosen a step earlier in BookingSection -- this
// form only collects contact details.
const formSchema = bookingSchema.omit({ startsAt: true, goal: true, preferredBarber: true });
export type BookingFormValues = z.infer<typeof formSchema>;

type BookingFormProps = {
  onSubmit: (values: BookingFormValues) => void;
  submitting: boolean;
  submitError: string | null;
};

export function BookingForm({ onSubmit, submitting, submitError }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      smsConsent: false,
      notes: "",
      honeypot: "",
    },
  });

  const phoneValue = watch("phone");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <input {...register("firstName")} className="input" autoComplete="given-name" />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input {...register("lastName")} className="input" autoComplete="family-name" />
        </Field>
      </div>

      <Field label="Email" error={errors.email?.message}>
        <input {...register("email")} type="email" className="input" autoComplete="email" />
      </Field>

      <Field label="Phone" error={errors.phone?.message}>
        <input
          {...register("phone")}
          type="tel"
          className="input"
          autoComplete="tel"
          value={phoneValue ?? ""}
          onChange={(e) => setValue("phone", formatAsYouType(e.target.value))}
          placeholder="(555) 123-4567"
        />
      </Field>

      <Field label="Notes (optional)" error={errors.notes?.message}>
        <textarea
          {...register("notes")}
          className="input min-h-[80px] resize-none"
          placeholder="Style reference, allergies, anything we should know"
        />
      </Field>

      <label className="flex items-start gap-2.5 text-xs text-cream-dim">
        <input
          type="checkbox"
          {...register("smsConsent")}
          className="mt-0.5 h-4 w-4 rounded border-navy-600 bg-navy-900"
        />
        Text me appointment reminders. Msg &amp; data rates may apply, reply STOP to opt out.
      </label>

      {/* Honeypot -- hidden from real users, bots fill it and get silently accepted. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      {submitError && (
        <p className="rounded-lg border border-crimson-500/40 bg-crimson-500/10 px-4 py-3 text-sm text-crimson-400">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? "Booking..." : "Confirm Appointment"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-cream-dim">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-crimson-400">{error}</span>}
    </label>
  );
}
