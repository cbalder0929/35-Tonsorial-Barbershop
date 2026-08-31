import { config } from "@/lib/config";
import { emailShell, actionButton, detailCard, detailRow, BRAND } from "./shell";

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
    <p style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.03em;font-size:20px;color:${BRAND.cream};margin:0 0 16px;">Your booking is cancelled</p>
    ${detailCard(`
      <table role="presentation" width="100%">
        ${detailRow("Was", `${data.dateLabel} at ${data.timeLabel}`, true)}
      </table>
    `)}
    <p style="margin:0 0 24px;color:${BRAND.creamDim};">The chair is open for someone else now. Whenever you're ready, we'd love to see you back.</p>
    <p style="margin:0;">
      ${actionButton("Book Again", data.bookAgainUrl, "primary")}
    </p>
  `;

  return {
    subject: `Cancelled: ${data.dateLabel} at ${config.business.shortName}`,
    html: emailShell(body),
  };
}
