import { config } from "@/lib/config";
import { emailShell, actionButton } from "./shell";

export type CancelledEmailData = {
  firstName: string;
  dateLabel: string;
  timeLabel: string;
  bookAgainUrl: string;
};

export function cancelledEmail(data: CancelledEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="font-size:17px;font-weight:700;color:#fff;margin:0 0 16px;">Your booking is cancelled</p>
    <p style="margin:0 0 20px;">
      Your ${data.dateLabel} at ${data.timeLabel} appointment at ${config.business.name} has been cancelled.
      The chair is open for someone else now.
    </p>
    <p style="margin:0 0 24px;">Whenever you're ready, we'd love to see you in the chair.</p>
    <p style="margin:0;">
      ${actionButton("Book Again", data.bookAgainUrl, "#f2a93b")}
    </p>
  `;

  return {
    subject: `Cancelled: ${data.dateLabel} at ${config.business.shortName}`,
    html: emailShell(body),
  };
}
