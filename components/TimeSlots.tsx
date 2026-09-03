"use client";

import { glowClass } from "@/lib/glow";

export type TimeSlotOption = {
  startsAt: string;
  timeLabel: string;
};

type TimeSlotsProps = {
  slots: TimeSlotOption[];
  selectedStartsAt: string | null;
  onSelect: (startsAt: string) => void;
  glow?: number;
};

export function TimeSlots({ slots, selectedStartsAt, onSelect, glow = 1 }: TimeSlotsProps) {
  if (slots.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-cream-dim">
        No open times this day -- try another date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = slot.startsAt === selectedStartsAt;
        return (
          <button
            key={slot.startsAt}
            type="button"
            onClick={() => onSelect(slot.startsAt)}
            className={`min-h-[44px] rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              isSelected
                ? `border-transparent bg-crimson-600 text-cream ${glowClass(glow)}`
                : "border-navy-600 bg-navy-900/60 text-cream-dim hover:border-royal-400/60"
            }`}
          >
            {slot.timeLabel}
          </button>
        );
      })}
    </div>
  );
}
