"use client";

import { glowClass } from "@/lib/glow";

export type DateOption = {
  date: string;
  dateLabel: string;
  slotCount: number;
};

type DatePickerProps = {
  dates: DateOption[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  glow?: number;
};

export function DatePicker({ dates, selectedDate, onSelect, glow = 1 }: DatePickerProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
      {dates.map((d) => {
        const isSelected = d.date === selectedDate;
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelect(d.date)}
            className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              isSelected
                ? `border-transparent bg-crimson-600 text-cream ${glowClass(glow)}`
                : "border-navy-600 bg-navy-900/60 text-cream-dim hover:border-royal-400/60"
            }`}
          >
            {d.dateLabel}
          </button>
        );
      })}
    </div>
  );
}
