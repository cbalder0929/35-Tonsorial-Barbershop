import { config } from "@/lib/config";
import { emailShell, actionButton } from "./shell";

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
    <p style="font-size:17px;font-weight:700;color:#fff;margin:0 0 16px;">You're booked, ${data.firstName}!</p>
    <p style="margin:0 0 20px;">Your chair time at ${config.business.name} is set for:</p>
    <table role="presentation" style="width:100%;background:#1a1a1f;border-radius:12px;margin:0 0 20px;">
      <tr><td style="padding:16px 20px;font-size:16px;color:#fff;font-weight:600;">
        ${data.dateLabel} at ${data.timeLabel}
      </td></tr>
    </table>
    <p style="margin:0 0 8px;"><strong style="color:#fff;">Where:</strong> ${config.business.address.line1}, ${config.business.address.line2}</p>
    <p style="margin:0 0 20px;"><strong style="color:#fff;">What to bring:</strong> Just yourself -- and a reference photo if you have a style in mind.</p>
    <p style="margin:0 0 24px;">A calendar invite (.ics) is attached. Need to make a change?</p>
    <p style="margin:0;">
      ${actionButton("Confirm", data.confirmUrl, "#3fc9d6")}
      &nbsp;&nbsp;
      ${actionButton("Cancel", data.cancelUrl, "#e8407f")}
    </p>
  `;

  return {
    subject: `You're booked at ${config.business.shortName} -- ${data.dateLabel}`,
    html: emailShell(body),
  };
}
