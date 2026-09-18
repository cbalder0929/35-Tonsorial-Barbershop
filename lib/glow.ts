// Booking-flow progress glow -- level 1-5, clamped, mapped to the
// btn-glow-{n} utilities in globals.css. Class names are spelled out in
// full so Tailwind's content scan finds them; a template string like
// `btn-glow-${n}` would get purged from the build.
const GLOW_LEVELS = ["btn-glow-1", "btn-glow-2", "btn-glow-3", "btn-glow-4", "btn-glow-5"];

export function glowClass(level: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(level)));
  return `btn-glow ${GLOW_LEVELS[clamped - 1]}`;
}
