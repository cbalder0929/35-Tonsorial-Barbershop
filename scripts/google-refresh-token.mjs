// One-time OAuth flow to mint a GOOGLE_REFRESH_TOKEN.
// Usage: npm run google-token
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment
// (export them, or run `node -r dotenv/config scripts/google-refresh-token.mjs`).

import http from "node:http";
import { URL } from "node:url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";
const SCOPE = "https://www.googleapis.com/auth/calendar";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in the environment.\n" +
      "Set them (e.g. `set -a; source .env.local; set +a` on macOS/Linux) and re-run."
  );
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");

console.log("\nOpen this URL in your browser and approve access:\n");
console.log(authUrl.toString());
console.log("\nWaiting for the redirect to http://localhost:3000/oauth2callback ...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("Missing authorization code");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Success</h1><p>You can close this tab and return to the terminal.</p>");
  server.close();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("Token exchange failed:", data);
    process.exit(1);
  }

  console.log("\nAdd this to your .env.local:\n");
  console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`);
  process.exit(0);
});

server.listen(3000);
