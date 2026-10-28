"use server";

import { headers } from "next/headers";
import { allow } from "@/lib/rate-limit";
import { sendInterestEmail } from "@/lib/email";
import { interestSchema } from "@/lib/validation";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function submitInterest(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  // Bots fill the hidden field. Pretend success so they learn nothing.
  if (values.website) return { status: "success" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(ip)) {
    return { status: "error", message: "Too many submissions from this connection. Please try again in an hour.", values };
  }

  const parsed = interestSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Check the highlighted fields and try again.", fieldErrors, values };
  }

  const sent = await sendInterestEmail(parsed.data);
  if (!sent.ok) {
    return {
      status: "error",
      message: "We couldn't send your enquiry just now. Please try again shortly or email us directly.",
      values,
    };
  }
  return { status: "success" };
}
