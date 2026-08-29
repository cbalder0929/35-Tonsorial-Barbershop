// US phone normalization -- no external dependency.

const DIGITS_ONLY = /\D/g;

function digits(input: string): string {
  return input.replace(DIGITS_ONLY, "");
}

/** True if the input is a valid 10-digit US number (optionally with leading 1). */
export function isValidUsPhone(input: string): boolean {
  const d = digits(input);
  if (d.length === 10) return true;
  if (d.length === 11 && d.startsWith("1")) return true;
  return false;
}

/** Normalizes to E.164, e.g. "+15551234567". Throws if invalid -- validate first. */
export function toE164(input: string): string {
  const d = digits(input);
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  throw new Error(`Cannot normalize invalid phone number: ${input}`);
}

/** Formats partial input as the user types: (555) 123-4567 */
export function formatAsYouType(input: string): string {
  let d = digits(input);
  if (d.startsWith("1") && d.length > 10) d = d.slice(1);
  d = d.slice(0, 10);

  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Formats an E.164 number for display: +15551234567 -> (555) 123-4567 */
export function formatE164ForDisplay(e164: string): string {
  return formatAsYouType(e164);
}
