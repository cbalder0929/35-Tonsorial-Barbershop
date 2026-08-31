import { emailShell, detailCard, detailRow, BRAND } from "./shell";

export type AdminNotificationKind = "new" | "cancelled" | "rescheduled";

export type AdminNotificationData = {
  kind: AdminNotificationKind;
  firstName: string;
  lastName: string;
  email: string;
  phoneDisplay: string;
  dateLabel: string;
  timeLabel: string;
  goal: string | null;
  preferredBarber: string | null;
  notes: string | null;
  status: string;
  /** Only set when kind is "rescheduled". */
  previousDateLabel?: string;
  previousTimeLabel?: string;
};

const HEADLINE: Record<AdminNotificationKind, string> = {
  new: "New booking",
  cancelled: "Booking cancelled",
  rescheduled: "Booking rescheduled",
};

const SUBJECT_PREFIX: Record<AdminNotificationKind, string> = {
  new: "New booking",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

export function adminNotificationEmail(data: AdminNotificationData): {
  subject: string;
  html: string;
} {
  const clientName = `${data.firstName} ${data.lastName}`;

  const whenRow =
    data.kind === "rescheduled" && data.previousDateLabel && data.previousTimeLabel
      ? detailRow(
          "When",
          `<span style="text-decoration:line-through;color:${BRAND.creamDim};">${data.previousDateLabel} at ${data.previousTimeLabel}</span><br />${data.dateLabel} at ${data.timeLabel}`
        )
      : detailRow("When", `${data.dateLabel} at ${data.timeLabel}`);

  const body = `
    <p style="font-family:'Bebas Neue','Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:0.03em;font-size:20px;color:${BRAND.cream};margin:0 0 16px;">${HEADLINE[data.kind]}</p>
    ${detailCard(`
      <table role="presentation" width="100%">
        ${detailRow("Client", clientName)}
        ${whenRow}
        ${detailRow("Email", data.email)}
        ${detailRow("Phone", data.phoneDisplay)}
        ${detailRow("Service", data.goal ?? "--")}
        ${detailRow("Barber", data.preferredBarber ?? "No preference")}
        ${detailRow("Status", data.status)}
        ${detailRow("Notes", data.notes ?? "--", true)}
      </table>
    `)}
  `;

  return {
    subject: `${SUBJECT_PREFIX[data.kind]}: ${clientName} -- ${data.dateLabel}`,
    html: emailShell(body),
  };
}
