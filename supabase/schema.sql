-- 35th Tonsorial Barbershop -- booking system schema.
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create extension if not exists pgcrypto;

create table if not exists bookings (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  first_name             text not null,
  last_name              text not null,
  email                  text not null,
  phone                  text not null,
  goal                   text,
  preferred_barber       text,
  notes                  text,
  sms_consent            boolean not null default false,
  consent_ip             text,
  consent_at             timestamptz,
  starts_at              timestamptz not null,
  ends_at                timestamptz not null,
  timezone               text not null,
  status                 text not null default 'booked'
                           check (status in ('booked','confirmed','completed','cancelled','no_show')),
  google_event_id        text,
  confirmation_sent_at   timestamptz,
  admin_notified_at      timestamptz,
  reminder_24h_sent_at   timestamptz,
  reminder_1h_sent_at    timestamptz,
  reminder_2h_sent_at    timestamptz,
  followup_sent_at       timestamptz,
  confirmed_at           timestamptz,
  cancelled_at           timestamptz,
  action_token           text not null unique
);

create table if not exists message_log (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references bookings(id) on delete cascade,
  channel      text not null check (channel in ('email','sms')),
  kind         text not null,
  provider_id  text,
  status       text not null check (status in ('sent','failed','skipped')),
  error        text,
  sent_at      timestamptz not null default now()
);

-- THE critical index: prevents double-booking at the database level.
create unique index if not exists one_booking_per_slot
  on bookings (starts_at)
  where status in ('booked', 'confirmed');

-- For the cron queries (24h / 2h / 1h reminder windows).
create index if not exists bookings_upcoming
  on bookings (starts_at, status);

-- For confirm/cancel link lookups.
create index if not exists bookings_action_token
  on bookings (action_token);

-- Row Level Security: the anon key gets no policies. All reads and writes
-- go through API routes using the service role key, server-side only.
alter table bookings enable row level security;
alter table message_log enable row level security;
