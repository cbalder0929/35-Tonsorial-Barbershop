import { config } from "@/lib/config";
import { emailShell, actionButton, detailCard, detailRow, BRAND } from "./shell";

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
    <p style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.03em;font-size:20px;color:${BRAND.cream};margin:0 0 16px;">See you ${WINDOW_COPY[data.window]}, ${data.firstName}</p>
    ${detailCard(`
      <table role="presentation" width="100%">
        ${detailRow("When", `${data.dateLabel} at ${data.timeLabel}`)}
        ${detailRow("Where", `${config.business.address.line1}, ${config.business.address.line2}`, true)}
      </table>
    `)}
    <p style="margin:0 0 24px;color:${BRAND.creamDim};">Can't make it? Cancel below so we can offer the chair to someone else.</p>
    <p style="margin:0;">
      ${actionButton("Confirm", data.confirmUrl, "primary")}
      &nbsp;&nbsp;
      ${actionButton("Cancel", data.cancelUrl, "secondary")}
    </p>
  `;

  return {
    subject: `Reminder: your cut is ${WINDOW_COPY[data.window]} at ${config.business.shortName}`,
    html: emailShell(body),
  };
}
