// Booking-flow progress glow -- level 1-5, clamped, mapped to the
// btn-glow-{n} utilities in globals.css.
export function glowClass(level: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return `btn-glow btn-glow-${clamped}`;
}
