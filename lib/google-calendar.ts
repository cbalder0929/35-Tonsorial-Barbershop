import "server-only";
import { env, isGoogleConfigured, readOnlyCalendarIds } from "./env";
import type { BusyInterval } from "./availability";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

/** Exchanges the refresh token for a short-lived access token, cached in-process. */
export async function getAccessToken(): Promise<string> {
  if (!isGoogleConfigured()) {
    throw new Error("Google Calendar is not configured");
  }
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.googleClientId!,
      client_secret: env.googleClientSecret!,
      refresh_token: env.googleRefreshToken!,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.accessToken;
}

/** Calls freeBusy.query across every configured calendar (booking + read-only). */
export async function getBusyIntervals(
  calendarIds: string[],
  timeMin: Date,
  timeMax: Date
): Promise<BusyInterval[]> {
  if (calendarIds.length === 0) return [];
  const accessToken = await getAccessToken();

  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: calendarIds.map((id) => ({ id })),
    }),
  });

  if (!res.ok) {
    throw new Error(`freeBusy query failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    calendars: Record<string, { busy: { start: string; end: string }[] }>;
  };

  const intervals: BusyInterval[] = [];
  for (const cal of Object.values(data.calendars)) {
    for (const b of cal.busy) {
      intervals.push({ start: new Date(b.start), end: new Date(b.end) });
    }
  }
  return intervals;
}

export type CreateEventInput = {
  summary: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  attendeeEmail: string;
  attendeeName: string;
};

/** Creates an event on BOOKING_CALENDAR_ID with the customer as an attendee. */
export async function createCalendarEvent(
  input: CreateEventInput
): Promise<string> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(env.bookingCalendarId!)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: { dateTime: input.startsAt.toISOString() },
        end: { dateTime: input.endsAt.toISOString() },
        attendees: [{ email: input.attendeeEmail, displayName: input.attendeeName }],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Create calendar event failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}

/** Deletes an event when a booking is cancelled -- frees the slot for reuse. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(env.bookingCalendarId!)}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  // 410 Gone means it was already deleted -- treat as success (idempotent).
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    throw new Error(`Delete calendar event failed: ${res.status} ${await res.text()}`);
  }
}

export function allReadOnlyCalendarIds(): string[] {
  return readOnlyCalendarIds();
}
