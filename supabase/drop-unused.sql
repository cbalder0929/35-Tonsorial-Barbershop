-- Removes bookings columns and indexes the app never uses.
-- Run once in Supabase SQL Editor if your bookings table already exists.
-- Safe to re-run. Fresh installs from schema.sql don't need it.

alter table bookings
  drop column if exists confirmation_sent_at,
  drop column if exists admin_notified_at,
  drop column if exists followup_sent_at;

-- Duplicates the index Postgres already builds for action_token's
-- UNIQUE constraint (bookings_action_token_key).
drop index if exists bookings_action_token;
