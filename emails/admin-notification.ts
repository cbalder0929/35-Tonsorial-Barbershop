import { config } from "@/lib/config";
import { emailShell } from "./shell";

export type AdminNotificationData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneDisplay: string;
  dateLabel: string;
  timeLabel: string;
  goal: string | null;
  preferredBarber: string | null;
  notes: string | null;
};

export function adminNotificationEmail(data: AdminNotificationData): {
  subject: string;
  html: string;
} {
  const body = `
    <p style="font-size:17px;font-weight:700;color:#fff;margin:0 0 16px;">New booking on 35th</p>
    <table role="presentation" style="width:100%;font-size:14px;">
      <tr><td style="padding:4px 0;color:#8a8a94;width:120px;">Client</td><td style="padding:4px 0;color:#fff;">${data.firstName} ${data.lastName}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;">When</td><td style="padding:4px 0;color:#fff;">${data.dateLabel} at ${data.timeLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;">Email</td><td style="padding:4px 0;color:#fff;">${data.email}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;">Phone</td><td style="padding:4px 0;color:#fff;">${data.phoneDisplay}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;">Service</td><td style="padding:4px 0;color:#fff;">${data.goal ?? "--"}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;">Barber</td><td style="padding:4px 0;color:#fff;">${data.preferredBarber ?? "No preference"}</td></tr>
      <tr><td style="padding:4px 0;color:#8a8a94;vertical-align:top;">Notes</td><td style="padding:4px 0;color:#fff;">${data.notes ?? "--"}</td></tr>
    </table>
  `;

  return {
    subject: `New booking: ${data.firstName} ${data.lastName} -- ${data.dateLabel}`,
    html: emailShell(body),
  };
}
