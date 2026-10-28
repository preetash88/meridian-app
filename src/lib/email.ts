import type { InterestInput } from "./validation";

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function buildMessage(d: InterestInput) {
  const isEmployer = d.type === "employer";

  const rows: [string, string][] = isEmployer
      ? [
        ["Company", d.company],
        ["Hiring for", d.role],
        ["Industry", d.industry],
        ["Location", `${d.city}, ${d.state}, ${d.country}`],
        ["Timeframe", d.timing],
      ]
      : [
        ["Looking for", d.role],
        ["Industry", d.industry],
        ["Location", `${d.city}, ${d.state}, ${d.country}`],
        ["LinkedIn", d.linkedin || "Not provided"],
      ];

  const subject = isEmployer
      ? `Employer enquiry: ${oneLine(d.company)} — ${oneLine(d.role)}`
      : `Job seeker enquiry: ${oneLine(d.name)} — ${oneLine(d.role)}`;

  const accent = "#1f6f64";
  const bg = "#f3f5f3";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr><td style="background:${accent};padding:28px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600">
            New ${isEmployer ? "employer" : "job seeker"} enquiry
          </h1>
        </td></tr>

        <!-- Contact -->
        <tr><td style="padding:28px 32px 0">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:20px">
                <p style="margin:0 0 4px;font-size:12px;color:#4a5d69;text-transform:uppercase;letter-spacing:0.05em">Name</p>
                <p style="margin:0;font-size:16px;color:#0d2733;font-weight:600">${d.name}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:20px">
                <p style="margin:0 0 4px;font-size:12px;color:#4a5d69;text-transform:uppercase;letter-spacing:0.05em">Email</p>
                <p style="margin:0;font-size:16px"><a href="mailto:${d.email}" style="color:${accent};text-decoration:none">${d.email}</a></p>
              </td>
            </tr>
            ${d.phone ? `<tr>
              <td style="padding-bottom:20px">
                <p style="margin:0 0 4px;font-size:12px;color:#4a5d69;text-transform:uppercase;letter-spacing:0.05em">Phone</p>
                <p style="margin:0;font-size:16px"><a href="tel:${d.phone.replace(/\s/g, "")}" style="color:${accent};text-decoration:none">${d.phone}</a></p>
              </td>
            </tr>` : ""}
          </table>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e8ebe8;margin:0"></td></tr>

        <!-- Details -->
        <tr><td style="padding:20px 32px">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rows.map(([label, value]) => `
            <tr>
              <td style="padding:8px 0;width:140px;vertical-align:top">
                <p style="margin:0;font-size:13px;color:#4a5d69">${label}</p>
              </td>
              <td style="padding:8px 0;vertical-align:top">
                <p style="margin:0;font-size:15px;color:#0d2733;font-weight:500">${value}</p>
              </td>
            </tr>`).join("")}
          </table>
        </td></tr>

        ${d.message ? `
        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e8ebe8;margin:0"></td></tr>
        <!-- Message -->
        <tr><td style="padding:20px 32px">
          <p style="margin:0 0 8px;font-size:12px;color:#4a5d69;text-transform:uppercase;letter-spacing:0.05em">Message</p>
          <p style="margin:0;font-size:15px;color:#0d2733;line-height:1.6;white-space:pre-wrap">${d.message}</p>
        </td></tr>` : ""}

        <!-- Footer -->
        <tr><td style="padding:24px 32px;background:#f8faf8;border-top:1px solid #e8ebe8">
          <p style="margin:0;font-size:13px;color:#4a5d69">
            Reply directly to this email to respond to ${d.name}.
          </p>
        </td></tr>

      </table>

      <p style="margin:24px 0 0;font-size:12px;color:#9db2bd;text-align:center">
        Sent from the Meridian website interest form
      </p>
    </td></tr>
  </table>
</body>
</html>`.trim();

  // Plain-text fallback for email clients that don't render HTML
  const text = [
    `New ${isEmployer ? "employer" : "job seeker"} enquiry`,
    "",
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone || "not provided"}`,
    "",
    ...rows.map(([l, v]) => `${l}: ${v}`),
    "",
    "Message:",
    d.message || "(none)",
  ].join("\n");

  return { subject, html, text };
}

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "provider_error" };

export async function sendInterestEmail(d: InterestInput): Promise<SendResult> {
  const to = d.type === "employer" ? process.env.EMPLOYER_INBOX : process.env.CANDIDATE_INBOX;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const { subject, html, text } = buildMessage(d);

  if (!to || !key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[interest form] would email ${to ?? "(no inbox set)"}\n${subject}\n\n${text}\n`);
      return { ok: true };
    }
    console.error("[interest form] email is not configured. Lead was NOT delivered.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), reply_to: d.email, subject, html, text }),
    });
    if (!res.ok) {
      console.error("[interest form] provider error", res.status, await res.text());
      return { ok: false, reason: "provider_error" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[interest form] network error", err);
    return { ok: false, reason: "provider_error" };
  }
}