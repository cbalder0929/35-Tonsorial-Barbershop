"use client";

import { useState } from "react";
import { config } from "@/lib/config";

// Reads from config.copy.faqs -- no brand-specific styling to change.
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-pad">
      <span className="rule-facet mb-5" />
      <h2 className="font-display text-3xl uppercase tracking-wide text-cream sm:text-4xl">
        Frequently Asked
      </h2>
      <div className="mt-8 divide-y divide-navy-700/80 overflow-hidden rounded-2xl border border-navy-700/80 bg-navy-900/60">
        {config.copy.faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-cream sm:text-base"
              >
                {faq.question}
                <span
                  className={`shrink-0 text-xl text-gold transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm text-cream-dim">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
