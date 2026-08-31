import { config } from "@/lib/config";
import { emailShell, actionButton, detailCard, detailRow, BRAND } from "./shell";

export type ConfirmationEmailData = {
  firstName: string;
  dateLabel: string; // e.g. "Tue, Jul 25"
  timeLabel: string; // e.g. "9:00 AM"
  confirmUrl: string;
  cancelUrl: string;
};

export function confirmationEmail(data: ConfirmationEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.03em;font-size:20px;color:${BRAND.cream};margin:0 0 16px;">You're booked, ${data.firstName}</p>
    <p style="margin:0 0 20px;color:${BRAND.creamDim};">Your chair time at ${config.business.name} is set for:</p>
    ${detailCard(`
      <table role="presentation" width="100%">
        ${detailRow("When", `${data.dateLabel} at ${data.timeLabel}`)}
        ${detailRow("Where", `${config.business.address.line1}, ${config.business.address.line2}`, true)}
      </table>
    `)}
    <p style="margin:0 0 24px;color:${BRAND.creamDim};">A calendar invite (.ics) is attached. Need to make a change?</p>
    <p style="margin:0;">
      ${actionButton("Confirm", data.confirmUrl, "primary")}
      &nbsp;&nbsp;
      ${actionButton("Cancel", data.cancelUrl, "secondary")}
    </p>
  `;

  return {
    subject: `You're booked at ${config.business.shortName} -- ${data.dateLabel}`,
    html: emailShell(body),
  };
}
