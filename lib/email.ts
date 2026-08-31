import "server-only";
import { env, isResendConfigured } from "./env";
import { config } from "./config";

const RESEND_API = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  // content = base64. content_id enables `<img src="cid:...">` inline references.
  attachments?: { filename: string; content: string; content_id?: string }[];
};

export type SendEmailResult =
  | { status: "sent"; providerId: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

/** Thin Resend wrapper. Never throws -- email failures must not fail a booking. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return { status: "skipped", reason: "RESEND_API_KEY not set" };
  }

  // Blank FROM_EMAIL = sandbox mode: Resend only delivers to the account owner.
  const from = env.fromEmail
    ? `${config.business.shortName} <${env.fromEmail}>`
    : "onboarding@resend.dev";

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments,
      }),
    });

    if (!res.ok) {
      return { status: "failed", error: `${res.status} ${await res.text()}` };
    }

    const data = (await res.json()) as { id: string };
    return { status: "sent", providerId: data.id };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
