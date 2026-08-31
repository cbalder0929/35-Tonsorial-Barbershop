import { config } from "@/lib/config";
import { emailShell, actionButton, detailCard, detailRow, BRAND } from "./shell";

export type RescheduledEmailData = {
  firstName: string;
  previousDateLabel: string;
  previousTimeLabel: string;
  dateLabel: string;
  timeLabel: string;
  confirmUrl: string;
  cancelUrl: string;
};

export function rescheduledEmail(data: RescheduledEmailData): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.03em;font-size:20px;color:${BRAND.cream};margin:0 0 16px;">You're rescheduled, ${data.firstName}</p>
    <p style="margin:0 0 20px;color:${BRAND.creamDim};">Your chair time at ${config.business.name} has moved:</p>
    ${detailCard(`
      <table role="presentation" width="100%">
        ${detailRow("Was", `<span style="text-decoration:line-through;color:${BRAND.creamDim};">${data.previousDateLabel} at ${data.previousTimeLabel}</span>`)}
        ${detailRow("Now", `${data.dateLabel} at ${data.timeLabel}`, true)}
      </table>
    `)}
    <p style="margin:0 0 8px;color:${BRAND.creamDim};"><strong style="color:${BRAND.cream};">Where:</strong> ${config.business.address.line1}, ${config.business.address.line2}</p>
    <p style="margin:0 0 24px;color:${BRAND.creamDim};">An updated calendar invite (.ics) is attached. Need to make another change?</p>
    <p style="margin:0;">
      ${actionButton("Confirm", data.confirmUrl, "primary")}
      &nbsp;&nbsp;
      ${actionButton("Cancel", data.cancelUrl, "secondary")}
    </p>
  `;

  return {
    subject: `Rescheduled: ${config.business.shortName} -- ${data.dateLabel}`,
    html: emailShell(body),
  };
}
