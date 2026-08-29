import { config } from "@/lib/config";
import { emailShell, actionButton } from "./shell";

export type ReminderEmailData = {
  firstName: string;
  dateLabel: string;
  timeLabel: string;
  window: "24h" | "2h" | "1h";
  confirmUrl: string;
  cancelUrl: string;
};

const WINDOW_COPY: Record<ReminderEmailData["window"], string> = {
  "24h": "tomorrow",
  "2h": "in about 2 hours",
  "1h": "in about 1 hour",
};

export function reminderEmail(data: ReminderEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="font-size:17px;font-weight:700;color:#fff;margin:0 0 16px;">See you ${WINDOW_COPY[data.window]}, ${data.firstName}</p>
    <table role="presentation" style="width:100%;background:#1a1a1f;border-radius:12px;margin:0 0 20px;">
      <tr><td style="padding:16px 20px;font-size:16px;color:#fff;font-weight:600;">
        ${data.dateLabel} at ${data.timeLabel}
      </td></tr>
    </table>
    <p style="margin:0 0 8px;"><strong style="color:#fff;">Where:</strong> ${config.business.address.line1}, ${config.business.address.line2}</p>
    <p style="margin:0 0 24px;">Can't make it? Cancel below so we can offer the chair to someone else.</p>
    <p style="margin:0;">
      ${actionButton("Confirm", data.confirmUrl, "#3fc9d6")}
      &nbsp;&nbsp;
      ${actionButton("Cancel", data.cancelUrl, "#e8407f")}
    </p>
  `;

  return {
    subject: `Reminder: your cut is ${WINDOW_COPY[data.window]} at ${config.business.shortName}`,
    html: emailShell(body),
  };
}
