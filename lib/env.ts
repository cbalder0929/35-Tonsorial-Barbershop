import "server-only";

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),

  googleClientId: read("GOOGLE_CLIENT_ID"),
  googleClientSecret: read("GOOGLE_CLIENT_SECRET"),
  googleRefreshToken: read("GOOGLE_REFRESH_TOKEN"),
  bookingCalendarId: read("BOOKING_CALENDAR_ID"),
  schoolCalendarId: read("SCHOOL_CALENDAR_ID"),
  workCalendarId: read("WORK_CALENDAR_ID"),
  personalCalendarId: read("PERSONAL_CALENDAR_ID"),

  resendApiKey: read("RESEND_API_KEY"),
  fromEmail: read("FROM_EMAIL"),

  siteUrl: read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  businessTimezone: read("BUSINESS_TIMEZONE") ?? "America/Chicago",
  trainerPhone: read("TRAINER_PHONE"),
  cronSecret: read("CRON_SECRET"),
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey
  );
}

export function isGoogleConfigured(): boolean {
  return Boolean(
    env.googleClientId &&
      env.googleClientSecret &&
      env.googleRefreshToken &&
      env.bookingCalendarId
  );
}

export function isResendConfigured(): boolean {
  return Boolean(env.resendApiKey);
}

export function readOnlyCalendarIds(): string[] {
  return [env.schoolCalendarId, env.workCalendarId, env.personalCalendarId].filter(
    (id): id is string => Boolean(id)
  );
}

export function allBusyCalendarIds(): string[] {
  const ids = [env.bookingCalendarId, ...readOnlyCalendarIds()];
  return ids.filter((id): id is string => Boolean(id));
}
