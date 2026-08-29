import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidUsPhone, toE164, formatAsYouType } from "../phone";

test("isValidUsPhone accepts 10-digit numbers", () => {
  assert.equal(isValidUsPhone("5551234567"), true);
  assert.equal(isValidUsPhone("(555) 123-4567"), true);
});

test("isValidUsPhone accepts 11-digit numbers with leading 1", () => {
  assert.equal(isValidUsPhone("15551234567"), true);
});

test("isValidUsPhone rejects invalid lengths", () => {
  assert.equal(isValidUsPhone("555123"), false);
  assert.equal(isValidUsPhone(""), false);
  assert.equal(isValidUsPhone("25551234567"), false); // 11 digits, no leading 1
});

test("toE164 normalizes 10-digit numbers", () => {
  assert.equal(toE164("(555) 123-4567"), "+15551234567");
});

test("toE164 normalizes 11-digit numbers with leading 1", () => {
  assert.equal(toE164("1-555-123-4567"), "+15551234567");
});

test("toE164 throws on invalid input", () => {
  assert.throws(() => toE164("123"));
});

test("formatAsYouType formats progressively", () => {
  assert.equal(formatAsYouType("5"), "(5");
  assert.equal(formatAsYouType("555123"), "(555) 123");
  assert.equal(formatAsYouType("5551234567"), "(555) 123-4567");
});
