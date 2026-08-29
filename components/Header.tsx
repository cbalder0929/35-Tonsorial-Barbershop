import { config } from "@/lib/config";

// Deliberately minimal -- a text wordmark, not the emblem, so navigation
// never competes with the floating logo in the Hero. Sticky so Book Now
// stays reachable with one hand while scrolling through pricing and FAQ.
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/70 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#hero" className="font-display text-base uppercase tracking-wide text-cream sm:text-lg">
          {config.business.shortName}
        </a>
        <a
          href="#booking"
          className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-crimson-600 px-5 text-xs font-bold text-cream transition-colors hover:bg-crimson-500 sm:text-sm"
        >
          Book Now
        </a>
      </div>
    </header>
  );
}
