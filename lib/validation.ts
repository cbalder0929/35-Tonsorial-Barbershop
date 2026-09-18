import { z } from "zod";
import { isValidUsPhone } from "./phone";

// Used on both client (React Hook Form) and server (API route re-validation).
export const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .refine(isValidUsPhone, "Enter a valid US phone number"),
  goal: z.string().trim().max(80).optional().or(z.literal("")),
  preferredBarber: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  smsConsent: z.boolean().default(false),
  startsAt: z.string().datetime({ message: "Invalid time slot" }),
  // Hidden field -- if filled, it's a bot. Never surfaced in the UI.
  honeypot: z.string().max(0, "").optional().or(z.literal("")),
});

export const rescheduleSchema = z.object({
  startsAt: z.string().datetime({ message: "Invalid time slot" }),
});

export const availabilityQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD"),
  days: z.coerce.number().int().min(1).max(60).default(14),
});
