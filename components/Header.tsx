"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";

// Deliberately minimal -- a text wordmark, not the emblem, so navigation
// never competes with the floating logo in the Hero. Sticky so Book Now
// stays reachable with one hand once it appears -- it only shows up after
// the visitor has scrolled past the booking section, since it's redundant
// while that section is already on screen.
export function Header() {
  const [showBookButton, setShowBookButton] = useState(false);

  useEffect(() => {
    const bookingSection = document.getElementById("booking");
    if (!bookingSection) return;

    function handleScroll() {
      setShowBookButton(bookingSection!.getBoundingClientRect().bottom < 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/70 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <a href="#hero" className="font-display text-base uppercase tracking-wide text-cream sm:text-lg">
          {config.business.shortName}
        </a>

        <div className="hidden items-center gap-2 sm:flex">
          <a
            href={config.business.address.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-navy-600 bg-navy-900/70 px-4 text-xs font-semibold text-cream-dim transition-colors hover:border-royal-400/60 hover:text-cream"
          >
            {config.business.address.line1}
          </a>
          <a
            href={`tel:${config.business.phone}`}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-navy-600 bg-navy-900/70 px-4 text-xs font-semibold text-cream-dim transition-colors hover:border-royal-400/60 hover:text-cream"
          >
            {config.business.phoneDisplay}
          </a>
        </div>

        <a
          href="#booking"
          className={`inline-flex min-h-[40px] items-center justify-center rounded-full bg-crimson-600 px-5 text-xs font-bold text-cream transition-all duration-300 hover:bg-crimson-500 sm:text-sm ${
            showBookButton ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Book Now
        </a>
      </div>
    </header>
  );
}
