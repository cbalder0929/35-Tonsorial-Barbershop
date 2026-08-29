// Single source of truth for all business details, copy, pricing, and
// booking rules. Change your info once here -- it flows into the landing
// page, emails, and calendar events. See BLUEPRINT.md section 16.

export type WeeklyRule = {
  /** 0 = Sunday ... 6 = Saturday */
  dayOfWeek: number;
  /** Local (BUSINESS_TIMEZONE) 24h start time, e.g. "09:00" */
  startTime: string;
  /** Local (BUSINESS_TIMEZONE) 24h end time, e.g. "19:00" */
  endTime: string;
};

export const config = {
  business: {
    name: "35th Tonsorial Barbershop",
    shortName: "35th Tonsorial",
    // TODO: no public email on record -- replace with the shop's real inbox.
    email: "book@35thtonsorial.com",
    phone: "+17738887048",
    phoneDisplay: "(773) 888-7048",
    address: {
      line1: "3520 S Archer Ave",
      line2: "Chicago, IL 60609",
      mapsUrl: "https://maps.google.com/?q=3520+S+Archer+Ave+Chicago+IL+60609",
    },
    // From the shop's Google Business listing.
    googleRating: 5.0,
    googleReviewCount: 14,
  },

  // The barbers clients ask for by name (per Google reviews).
  team: [
    { id: "uriel", name: "Uriel" },
    { id: "jose", name: "Jose" },
    { id: "elmer", name: "Elmer" },
  ],

  // IANA timezone -- also set BUSINESS_TIMEZONE in .env.local to match.
  timezone: "America/Chicago",

  booking: {
    sessionLengthMinutes: 45,
    minNoticeHours: 4,
    maxAdvanceDays: 21,
    // TODO: confirmed data point is "Opens 10 AM Fri" -- verify the rest of
    // the week against the shop's actual posted hours before going live.
    weeklyRules: [
      { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" }, // Tue
      { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" }, // Wed
      { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" }, // Thu
      { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" }, // Fri
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" }, // Sat
    ] satisfies WeeklyRule[],
  },

  // TODO: placeholder pricing -- confirm real prices with the shop before launch.
  pricing: [
    {
      id: "haircut",
      name: "Haircut",
      description: "Precision fade, taper, or scissor cut with a clean finish.",
      price: 35,
      premium: false,
    },
    {
      id: "beard",
      name: "Beard Trim",
      description: "Line-up and shape with a hot towel finish.",
      price: 20,
      premium: false,
    },
    {
      id: "combo",
      name: "Haircut + Beard",
      description: "Full cut and beard combo -- our most popular service.",
      price: 50,
      premium: false,
    },
    {
      id: "kids",
      name: "Kids Cut",
      description: "For clients 12 and under.",
      price: 25,
      premium: false,
    },
    {
      id: "lineup",
      name: "Line-Up",
      description: "A quick edge-up between full cuts.",
      price: 15,
      premium: false,
    },
    {
      id: "hot-towel-shave",
      name: "Hot Towel Shave",
      description: "Traditional straight-razor shave with hot towel prep.",
      price: 30,
      premium: true,
    },
  ],

  copy: {
    hero: {
      tagline: "Tradition. Craftsmanship. Confidence.",
      ctaLabel: "Book Now",
      secondaryCtaLabel: "View Pricing",
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
        answer: "Card or cash, paid at the chair after your service.",
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

export type PricingItem = (typeof config.pricing)[number];
export type TeamMember = (typeof config.team)[number];
