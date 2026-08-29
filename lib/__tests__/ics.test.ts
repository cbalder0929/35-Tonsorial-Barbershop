import { test } from "node:test";
import assert from "node:assert/strict";
import { generateIcs } from "../ics";

const baseEvent = {
  uid: "test-uid-123@35thtonsorial.com",
  startsAt: new Date("2026-08-25T14:00:00.000Z"),
  endsAt: new Date("2026-08-25T14:45:00.000Z"),
  summary: "35th Tonsorial -- Appointment",
  description: "Test description",
  location: "3512 W 35th Street, Chicago, IL",
};

test("generateIcs produces a well-formed VCALENDAR block", () => {
  const ics = generateIcs(baseEvent);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.trim().endsWith("END:VCALENDAR"));
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /END:VEVENT/);
});

test("generateIcs formats UTC timestamps correctly", () => {
  const ics = generateIcs(baseEvent);
  assert.match(ics, /DTSTART:20260825T140000Z/);
  assert.match(ics, /DTEND:20260825T144500Z/);
});

test("generateIcs escapes special characters in text fields", () => {
  const ics = generateIcs({
    ...baseEvent,
    summary: "Cut; Line-up, Beard",
    description: "Line 1\nLine 2",
  });
  assert.match(ics, /SUMMARY:Cut\\; Line-up\\, Beard/);
  assert.match(ics, /DESCRIPTION:Line 1\\nLine 2/);
});

test("generateIcs includes the UID for idempotent calendar updates", () => {
  const ics = generateIcs(baseEvent);
  assert.match(ics, new RegExp(`UID:${baseEvent.uid}`));
});
