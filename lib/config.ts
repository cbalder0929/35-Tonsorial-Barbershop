// Single source of truth for all business details, copy, pricing, and
// booking rules. Change your info once here -- it flows into the landing
// page, emails, and calendar events. See BLUEPRINT.md section 16.

export type WeeklyRule = {
  /** 0 = Sunday ... 6 = Saturday */
  dayOfWeek: number;
  /** Local (config.timezone) 24h start time, e.g. "09:00" */
  startTime: string;
  /** Local (config.timezone) 24h end time, e.g. "19:00" */
  endTime: string;
};

export const config = {
  business: {
    name: "35th Tonsorial Barbershop",
    shortName: "35th Tonsorial",
    email: "squirreltonsorial@gmail.com",
    phone: "+17738887048",
    phoneDisplay: "(773) 888-7048",
    address: {
      line1: "3520 S Archer Ave",
      line2: "Chicago, IL 60609",
      mapsUrl: "https://maps.google.com/?q=3520+S+Archer+Ave+Chicago+IL+60609",
    },
    // From the shop's Google Business listing.
    googleRating: 5.0,
    googleReviewCount: 93,
  },

  // Barbers, their weekly schedules (display only), and contact info.
  // Phone numbers are for walk-ins.
  team: [
    {
      id: "adrian",
      name: "Adrian",
      phone: "+13125814152",
      phoneDisplay: "(312) 581-4152",
      email: "aadriansal06@gmail.com",
      minutesPerCut: 45,
      note: "",
      schedule: [
        { days: "Monday", hours: "Off" },
        { days: "Tuesday", hours: "10AM-7PM" },
        { days: "Wednesday-Friday", hours: "10AM-4PM" },
        { days: "Saturday", hours: "9AM-4PM" },
        { days: "Sunday", hours: "9AM-12PM" },
      ],
    },
    {
      id: "christian",
      name: "Christian",
      phone: "+13126477577",
      phoneDisplay: "(312) 647-7577",
      email: "8afadezz@gmail.com",
      minutesPerCut: 45,
      note: "Appointments start 3:30PM, 4:15PM, 5:00PM, and so on.",
      schedule: [
        { days: "Monday-Thursday", hours: "3:30PM-6:30PM" },
        { days: "Friday", hours: "3:30PM-7PM" },
        { days: "Saturday", hours: "9AM-4PM" },
        { days: "Sunday", hours: "Off" },
      ],
    },
    {
      id: "elmer",
      name: "Elmer",
      phone: "+13129374411",
      phoneDisplay: "+1 (312) 937-4411",
      email: "Elmercutz_1@yahoo.com",
      minutesPerCut: 45,
      note: "",
      schedule: [
        { days: "Monday", hours: "Off" },
        { days: "Tuesday-Friday", hours: "4PM-6:30PM" },
        { days: "Saturday", hours: "9AM-4PM" },
        { days: "Sunday", hours: "9AM-1PM" },
      ],
    },
    {
      id: "jose",
      name: "Jose A. (Owner)",
      phone: "+17738154663",
      phoneDisplay: "(773) 815-4663",
      email: "35thtonsorialbarbershop@gmail.com",
      minutesPerCut: 30,
      note: "Appointments only Thursday-Saturday. Sunday hours alternate: one week open, one week off.",
      schedule: [
        { days: "Monday-Wednesday", hours: "10AM-2:30PM" },
        { days: "Thursday", hours: "10AM-6:30PM" },
        { days: "Friday", hours: "9AM-6:30PM" },
        { days: "Saturday", hours: "9AM-4PM" },
        { days: "Sunday", hours: "9AM-12PM (every other week)" },
      ],
    },
  ],

  // IANA timezone for slot generation, labels, and emails.
  timezone: "America/Chicago",

  booking: {
    sessionLengthMinutes: 45,
    minNoticeHours: 4,
    maxAdvanceDays: 21,
    // Fraction of the service price collected as a deposit via Stripe at
    // booking time. Remainder is due at the chair. Non-refundable if the
    // customer cancels or no-shows -- see app/terms/page.tsx.
    depositPercent: 0.5,
    weeklyRules: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "12:00" }, // Sun
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" }, // Mon
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" }, // Tue
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" }, // Wed
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" }, // Thu
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:30" }, // Fri
      { dayOfWeek: 6, startTime: "09:00", endTime: "16:00" }, // Sat
    ] satisfies WeeklyRule[],
  },

  pricing: [
    {
      id: "haircut",
      name: "Haircut",
      description: "Precision fade, taper, or scissor cut with a clean finish.",
      price: 55,
      premium: false,
    },
    {
      id: "combo",
      name: "Haircut + Beard",
      description: "Full cut and beard combo -- our most popular service.",
      price: 70,
      premium: false,
    },
  ],

  copy: {
    hero: {
      tagline: "Tradition. Craftsmanship. Confidence.",
    },
    faqs: [
      {
        question: "How do I book an appointment?",
        answer:
          "Pick a service, your preferred barber, and an open time below -- takes under a minute. You'll get an email confirmation right away.",
      },
      {
        question: "Do you accept walk-ins?",
        answer:
          "We do when a chair is open, but booked appointments are always seen first. Booking ahead guarantees your time.",
      },
      {
        question: "How long is an appointment?",
        answer: "Most appointments run about 45 minutes, depending on the service.",
      },
      {
        question: "What is the cancellation policy?",
        answer:
          "Use the cancel link in your confirmation email any time before your appointment -- your chair time reopens instantly for the next client.",
      },
      {
        question: "What happens if I'm late?",
        answer:
          "We'll always try to fit you in, but arriving more than 10 minutes late may mean rebooking to protect the next client's time.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "A 50% deposit is charged securely through Stripe when you book online -- the rest is due at the chair by card or cash. Deposits are non-refundable for cancellations or no-shows, but carry over automatically if you reschedule instead.",
      },
      {
        question: "Do you offer beard services?",
        answer:
          "Yes -- beard trims, line-ups, and hot towel shaves are all on the menu, on their own or combined with a haircut.",
      },
    ],
    footer: {
      copyrightName: "35th Tonsorial Barbershop",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  },
} as const;

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function to12Hour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

/** Groups the weekly rules into compact display lines, e.g. "Tue-Fri: 10AM-7PM". */
export function formatWeeklyHours(
  rules: readonly WeeklyRule[] = config.booking.weeklyRules
): string[] {
  const labels = DAY_ABBR.map((_, day) => {
    const rule = rules.find((r) => r.dayOfWeek === day);
    return rule ? `${to12Hour(rule.startTime)}-${to12Hour(rule.endTime)}` : "Closed";
  });

  const lines: string[] = [];
  let i = 0;
  while (i < 7) {
    let j = i;
    while (j + 1 < 7 && labels[j + 1] === labels[i]) j++;
    const dayRange = i === j ? DAY_ABBR[i] : `${DAY_ABBR[i]}-${DAY_ABBR[j]}`;
    lines.push(`${dayRange}: ${labels[i]}`);
    i = j + 1;
  }
  return lines;
}
