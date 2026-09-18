import "server-only";
import { config } from "./config";
import { env, isTwilioConfigured } from "./env";

export type SmsResult =
  | { status: "sent"; providerId: string }
  | { status: "skipped"; error?: string }
  | { status: "failed"; error: string };

type SendSmsInput = {
  to: string;
  body: string;
};

function twilioEndpoint(): string {
  return `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64")}`;
}

/** Thin Twilio wrapper. Never throws -- SMS failures must not fail bookings. */
export async function sendSms({ to, body }: SendSmsInput): Promise<SmsResult> {
  if (!isTwilioConfigured()) {
    return { status: "skipped", error: "Twilio is not configured" };
  }

  const form = new URLSearchParams({
    To: to,
    Body: `${body}\n\nReply STOP to opt out. ${config.business.shortName}`,
  });

  if (env.twilioMessagingServiceSid) {
    form.set("MessagingServiceSid", env.twilioMessagingServiceSid);
  } else {
    form.set("From", env.twilioFromPhone!);
  }

  try {
    const res = await fetch(twilioEndpoint(), {
      method: "POST",
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = json?.message ? String(json.message) : await res.text().catch(() => "");
      return { status: "failed", error: `${res.status} ${message}`.trim() };
    }

    return { status: "sent", providerId: String(json?.sid ?? "") };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : "Unknown SMS error" };
  }
}
