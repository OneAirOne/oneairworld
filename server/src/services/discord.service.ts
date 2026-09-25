import https from "https";

/**
 * Post a message to a Discord channel through an incoming webhook.
 *
 * The webhook URL is a secret, so it is read from the DISCORD_WEBHOOK_URL
 * environment variable (server-side only). When unset, notifications are
 * silently skipped. Never throws: a Discord outage must not affect the game.
 */
export function notifyDiscord(content: string): void {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[DISCORD] Skipped: DISCORD_WEBHOOK_URL is not set");
    return;
  }

  try {
    const body = JSON.stringify({
      content,
      username: "OneAirWorld Bot",
      avatar_url: "https://erwangilbert.com/favicon.ico",
      // Player-controlled text is embedded in the message: never let it ping anyone.
      allowed_mentions: { parse: [] },
    });
    const req = https.request(
      webhookUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 5000,
      },
      (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 400) {
          console.warn(`[DISCORD] Webhook responded with ${res.statusCode}`);
        } else {
          console.log(`[DISCORD] Notification sent (${res.statusCode})`);
        }
      }
    );
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (error) => console.warn("[DISCORD] Notification failed:", error.message));
    req.end(body);
  } catch (error) {
    console.warn("[DISCORD] Notification failed:", error);
  }
}
