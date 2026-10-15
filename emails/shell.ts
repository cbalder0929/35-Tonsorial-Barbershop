// Wrapper for every outgoing email. Mirrors the live site's design system
// (see tailwind.config.ts + app/globals.css): black card on a red ground, a logo-red
// accent, white text, Bebas Neue headlines over Inter body copy.
// CUSTOMIZE: colours and copy below to re-brand.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "@/lib/config";

export const BRAND = {
  navy950: "#000000",
  navy900: "#0a0a0a",
  navy800: "#161616",
  navy700: "#3a3a3a",
  navy600: "#555555",
  crimson600: "#d90000",
  cream: "#ffffff",
  creamDim: "#d9d4d4",
};

const BODY_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif";

export const LOGO_CID = "brand-logo";

/**
 * The logo as an inline CID attachment -- not a hosted URL, so it renders in
 * a real inbox even though the site itself isn't deployed yet (a localhost
 * URL would show as a broken image to anyone but the sender's own machine).
 * Merge this into every outgoing email's `attachments` array.
 */
export function logoAttachment(): { filename: string; content: string; content_id: string } {
  const bytes = readFileSync(join(process.cwd(), "emails/assets/logo.png"));
  return {
    filename: "logo.png",
    content: bytes.toString("base64"),
    content_id: LOGO_CID,
  };
}

export function emailShell(bodyHtml: string): string {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${config.business.name}</title>
    <style>
      @media (max-width: 480px) {
        .container { width: 100% !important; }
        .pad { padding-left: 20px !important; padding-right: 20px !important; }
        .btn-stack { display: block !important; width: 100% !important; margin: 0 0 10px 0 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#8a0a0a;font-family:${BODY_FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#8a0a0a;padding:36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:${BRAND.navy900};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.navy700};">
            <tr>
              <td align="center" style="padding:32px 32px 24px;background:${BRAND.navy950};border-bottom:1px solid ${BRAND.navy700};">
                <img src="cid:${LOGO_CID}" width="300" height="100" alt="${config.business.name}" style="display:block;margin:0 auto;border:0;object-fit:contain;" />
                <div style="width:44px;height:3px;background:${BRAND.crimson600};border-radius:999px;margin:14px auto 0;"></div>
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:32px;color:${BRAND.cream};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td class="pad" style="padding:22px 32px;border-top:1px solid ${BRAND.navy700};color:${BRAND.creamDim};font-size:12.5px;line-height:1.7;">
                <strong style="color:${BRAND.cream};letter-spacing:0.02em;">${config.business.name}</strong><br />
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

type ButtonVariant = "primary" | "secondary";

/** Pill button matching .btn-primary / .btn-secondary on the live site. */
export function actionButton(
  label: string,
  href: string,
  variant: ButtonVariant = "primary"
): string {
  const styles =
    variant === "primary"
      ? `background:${BRAND.crimson600};color:${BRAND.cream};border:1px solid ${BRAND.crimson600};`
      : `background:${BRAND.navy900};color:${BRAND.cream};border:1px solid ${BRAND.navy600};`;

  return `<a href="${href}" class="btn-stack" style="display:inline-block;padding:13px 26px;${styles}font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">${label}</a>`;
}

/** Card-glass style detail panel (date/time, or a label/value table). */
export function detailCard(innerHtml: string): string {
  return `<table role="presentation" width="100%" style="width:100%;background:${BRAND.navy800};border:1px solid ${BRAND.navy700};border-radius:12px;margin:0 0 20px;"><tr><td style="padding:18px 20px;">${innerHtml}</td></tr></table>`;
}

export function detailRow(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : `border-bottom:1px solid ${BRAND.navy700};`;
  return `<tr>
    <td style="padding:8px 0;${border}color:${BRAND.creamDim};font-size:13px;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;${border}color:${BRAND.cream};font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
  </tr>`;
}
