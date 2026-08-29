// Wrapper for every outgoing email: header with business name, footer with
// contact info. CUSTOMIZE: colours and copy below to re-brand.

import { config } from "@/lib/config";

export function emailShell(bodyHtml: string): string {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#141417;border-radius:16px;overflow:hidden;border:1px solid #26262d;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(90deg,#e8407f 0%,#f2a93b 45%,#3fc9d6 100%);">
                <span style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#0a0a0c;">
                  ${config.business.name}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#e8e8ec;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid #26262d;color:#8a8a94;font-size:13px;line-height:1.6;">
                <strong style="color:#c6c6cf;">${config.business.name}</strong><br />
                ${config.business.address.line1}, ${config.business.address.line2}<br />
                ${config.business.phoneDisplay} &middot; ${config.business.email}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export function actionButton(label: string, href: string, color: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${color};color:#0a0a0c;font-weight:700;text-decoration:none;border-radius:999px;font-size:14px;">${label}</a>`;
}
