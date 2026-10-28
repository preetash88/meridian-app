import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, msg = "This field is required.") =>
  z.string().trim().min(1, msg).max(max, `Keep this under ${max} characters.`);

const base = {
  name: required(120, "Enter your name."),
  email: z.string().trim().max(200).pipe(z.email("Enter a valid email address.")),
  phone: text(40).optional(),
  message: text(2000).optional(),
  consent: z.literal("on", { error: "Please agree to the privacy policy to continue." }),
  // Honeypot: real people never fill this in.
  website: text(200).max(0).optional(),
};

export const employerSchema = z.object({
  type: z.literal("employer"),
  company: required(160, "Enter your company name."),
  role: required(160, "Tell us which role you are hiring for."),
  industry: required(80, "Choose an industry."),
  city: required(120, "Enter the city or region."),
  timing: required(40, "Choose a timeframe."),
  ...base,
});

export const candidateSchema = z.object({
  type: z.literal("candidate"),
  role: required(160, "Tell us which role you are after."),
  industry: required(80, "Choose an industry."),
  city: required(120, "Enter your city."),
  linkedin: text(300).optional(),
  ...base,
});

export const interestSchema = z.discriminatedUnion("type", [employerSchema, candidateSchema]);
export type InterestInput = z.infer<typeof interestSchema>;

export const TIMINGS = ["As soon as possible", "Within a month", "In the next three months", "Just planning ahead"] as const;
