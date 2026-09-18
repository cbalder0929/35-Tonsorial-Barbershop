-- Upgrade an existing 35th Tonsorial Supabase project for Stripe payments.
-- Run once in Supabase SQL Editor if your bookings table already exists.

alter table bookings
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_amount_cents integer,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_payment_status_check'
  ) then
    alter table bookings
      add constraint bookings_payment_status_check
      check (payment_status in ('unpaid','checkout_created','paid','failed','refunded'));
  end if;
end $$;

-- One booking per Stripe Checkout session; also serves /payment/success lookups.
create unique index if not exists bookings_stripe_checkout_session_unique
  on bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- Earlier versions of this script and schema.sql created a second, redundant
-- index under this name. The unique index above covers it.
drop index if exists bookings_stripe_checkout_session;
