import type { InterestInput } from "./validation";

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function buildMessage(d: InterestInput) {
  const lines: string[] =
    d.type === "employer"
      ? [
          `Company: ${d.company}`,
          `Hiring for: ${d.role}`,
          `Industry: ${d.industry}`,
          `Location: ${d.city}`,
          `Timeframe: ${d.timing}`,
        ]
      : [
          `Looking for: ${d.role}`,
          `Industry: ${d.industry}`,
          `Location: ${d.city}`,
          `LinkedIn: ${d.linkedin || "not provided"}`,
        ];

  const text = [
    `New ${d.type === "employer" ? "employer" : "job seeker"} enquiry`,
    "",
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone || "not provided"}`,
    "",
    ...lines,
    "",
    "Message:",
    d.message || "(none)",
    "",
    "Privacy policy accepted: yes",
  ].join("\n");

  const subject =
    d.type === "employer"
      ? `Employer enquiry: ${oneLine(d.company)} (${oneLine(d.role)})`
      : `Job seeker enquiry: ${oneLine(d.name)} (${oneLine(d.role)})`;

  return { subject, text };
}

export type SendResult = { ok: true } | { ok: false; reason: "not_configured" | "provider_error" };

export async function sendInterestEmail(d: InterestInput): Promise<SendResult> {
  const to = d.type === "employer" ? process.env.EMPLOYER_INBOX : process.env.CANDIDATE_INBOX;
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const { subject, text } = buildMessage(d);

  if (!to || !key || !from) {
    if (process.env.NODE_ENV !== "production") {
      // Local development: show what would have been sent.
      console.log(`\n[interest form] would email ${to ?? "(no inbox set)"}\n${subject}\n\n${text}\n`);
      return { ok: true };
    }
    // Never pretend a lead was delivered in production.
    console.error("[interest form] email is not configured. Lead was NOT delivered.");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), reply_to: d.email, subject, text }),
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
