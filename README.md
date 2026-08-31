# 35th Tonsorial Barbershop

A Next.js booking website for 35th Tonsorial Barbershop. It includes appointment availability, booking confirmation and cancellation flows, Supabase persistence, optional Google Calendar synchronization, and optional Resend email notifications.

## Prerequisites

- Node.js 18.17 or later
- npm
- A Supabase project for booking storage

Google Calendar and Resend accounts are optional; bookings can be saved without either integration.

## Local setup

1. Clone the repository and open it in a terminal.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file from the template:

   ```bash
   copy .env.example .env.local
   ```

   On macOS or Linux, use:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in the required Supabase values in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

5. Apply `supabase/schema.sql` to your Supabase project's SQL editor.

## Start the app

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

To create and run a production build:

```bash
npm run build
npm start
```

## Environment variables

Use `.env.example` as the authoritative list. The values are grouped as follows:

| Group | Variables | Required |
| --- | --- | --- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| Site settings | `NEXT_PUBLIC_SITE_URL`, `BUSINESS_TIMEZONE`, `TRAINER_PHONE`, `CRON_SECRET` | Set for deployment |
| Google Calendar | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `BOOKING_CALENDAR_ID`, `SCHOOL_CALENDAR_ID`, `WORK_CALENDAR_ID`, `PERSONAL_CALENDAR_ID` | Optional |
| Email | `RESEND_API_KEY`, `FROM_EMAIL` | Optional |

Never commit `.env.local` or service-role keys.

### Google Calendar refresh token

After setting `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your local environment, run:

```bash
npm run google-token
```

Follow the browser authorization flow and save the generated token as `GOOGLE_REFRESH_TOKEN`.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run build` | Creates an optimized production build. |
| `npm start` | Runs the production build. |
| `npm run lint` | Runs ESLint. |
| `npm test` | Runs the test suite. |
| `npm run google-token` | Starts the Google OAuth refresh-token helper. |
