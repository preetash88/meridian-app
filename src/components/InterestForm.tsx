"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { submitInterest, type FormState } from "@/app/get-started/actions";
import { COUNTRIES, INDUSTRIES, SITE } from "@/lib/site";
import { TIMINGS } from "@/lib/validation";

type Kind = "employer" | "candidate";
const initial: FormState = { status: "idle" };

const inputCls =
    "mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-[1rem] text-ink placeholder:text-slate/60 transition-colors focus:border-verdigris focus:outline-none aria-[invalid=true]:border-red-700";
const selectCls =
    "mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-3 text-[1rem] text-ink transition-colors focus:border-verdigris focus:outline-none aria-[invalid=true]:border-red-700 max-h-[12rem]";

function Field({
                   label, name, type = "text", required, placeholder, error, defaultValue, autoComplete, hint,
               }: {
    label: string; name: string; type?: string; required?: boolean; placeholder?: string;
    error?: string; defaultValue?: string; autoComplete?: string; hint?: string;
}) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium">
                {label}
                {!required && <span className="font-normal text-slate"> (optional)</span>}
            </label>
            <input
                id={name} name={name} type={type} required={required} placeholder={placeholder}
                defaultValue={defaultValue} autoComplete={autoComplete}
                aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : hint ? `${name}-hint` : undefined}
                className={inputCls}
            />
            {hint && !error && <p id={`${name}-hint`} className="mt-1 text-sm text-slate">{hint}</p>}
            {error && <p id={`${name}-err`} className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>}
        </div>
    );
}

function Select({
                    label, name, options, error, defaultValue, required = true,
                }: { label: string; name: string; options: readonly { value: string; label: string }[]; error?: string; defaultValue?: string; required?: boolean }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium">{label}</label>
            <select
                id={name} name={name} required={required} defaultValue={defaultValue ?? ""}
                aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : undefined}
                className={selectCls}
            >
                <option value="" disabled>Select one</option>
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {error && <p id={`${name}-err`} className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>}
        </div>
    );
}

function LocationFields({ values, errors }: { values: Record<string, string>; errors: Record<string, string> }) {
    const [country, setCountry] = useState(values.country ?? "");
    const selectedCountry = COUNTRIES.find((c) => c.name === country);

    return (
        <>
            <div className="grid gap-5 sm:grid-cols-3">
                <div>
                    <label htmlFor="country" className="block text-sm font-medium">Country</label>
                    <select
                        id="country" name="country" required
                        defaultValue={values.country ?? ""}
                        aria-invalid={errors.country ? true : undefined}
                        onChange={(e) => setCountry(e.target.value)}
                        className={selectCls}
                    >
                        <option value="" disabled>Select country</option>
                        {COUNTRIES.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.country && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.country}</p>}
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium">State / Region</label>
                    <select
                        id="state" name="state" required
                        defaultValue={values.state ?? ""}
                        aria-invalid={errors.state ? true : undefined}
                        disabled={!selectedCountry}
                        className={clsx(selectCls, !selectedCountry && "opacity-50")}
                    >
                        <option value="" disabled>{selectedCountry ? "Select state" : "Select country first"}</option>
                        {selectedCountry?.states.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                    </select>
                    {errors.state && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{errors.state}</p>}
                </div>

                <Field label="City or suburb" name="city" required defaultValue={values.city} error={errors.city} />
            </div>
        </>
    );
}

export function InterestForm({ initialType, initialIndustry }: { initialType: Kind; initialIndustry?: string }) {
    const [kind, setKind] = useState<Kind>(initialType);
    const [state, action, pending] = useActionState(submitInterest, initial);
    const v = state.values ?? {};
    const e = state.fieldErrors ?? {};
    const industries = INDUSTRIES.map((i) => ({ value: i.name, label: i.name }));
    const preset = INDUSTRIES.find((i) => i.slug === initialIndustry)?.name;

    if (state.status === "success") {
        return (
            <div role="status" className="glass-strong rounded-card p-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-verdigris" aria-hidden="true" />
                <h2 className="mt-5 text-3xl font-semibold">Thanks, we have your enquiry.</h2>
                <p className="mx-auto mt-3 max-w-md text-slate">We'll reply within {SITE.responseTime}. If it's urgent, email {SITE.email}.</p>
            </div>
        );
    }

    return (
        <div className="glass-strong rounded-card p-6 sm:p-10">
            <div role="radiogroup" aria-label="I am" className="grid grid-cols-2 gap-1 rounded-full border border-line bg-surface/50 p-1">
                {([["employer", "I'm hiring"], ["candidate", "I'm looking for work"]] as const).map(([k, label]) => (
                    <button
                        key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
                        className={clsx("rounded-full px-4 py-2.5 text-[0.95rem] font-medium transition-colors", kind === k ? "bg-ink text-chalk shadow-sm" : "text-slate hover:text-ink")}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form action={action} className="mt-8 space-y-5" noValidate>
                <input type="hidden" name="type" value={kind} />
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>Leave this empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>

                {state.status === "error" && state.message && (
                    <p role="alert" className="rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-950/50 dark:text-red-200">{state.message}</p>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Your name" name="name" required autoComplete="name" defaultValue={v.name} error={e.name} />
                    <Field label="Email" name="email" type="email" required autoComplete="email" defaultValue={v.email} error={e.email} />
                </div>
                <Field label="Phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} error={e.phone} />

                {kind === "employer" ? (
                    <>
                        <Field label="Company" name="company" required autoComplete="organization" defaultValue={v.company} error={e.company} />
                        <Field label="Role you're hiring for" name="role" required placeholder="e.g. Operations Manager" defaultValue={v.role} error={e.role} />
                        <Select label="Industry" name="industry" options={industries} defaultValue={v.industry ?? preset} error={e.industry} />
                        <LocationFields values={v} errors={e} />
                        <Select label="When do you need someone?" name="timing" options={TIMINGS.map((t) => ({ value: t, label: t }))} defaultValue={v.timing} error={e.timing} />
                    </>
                ) : (
                    <>
                        <Field label="Role you're after" name="role" required placeholder="e.g. Data Analyst" defaultValue={v.role} error={e.role} />
                        <Select label="Industry" name="industry" options={industries} defaultValue={v.industry ?? preset} error={e.industry} />
                        <LocationFields values={v} errors={e} />
                        <Field label="LinkedIn profile" name="linkedin" type="url" placeholder="https://www.linkedin.com/in/…" defaultValue={v.linkedin} error={e.linkedin} />
                    </>
                )}

                <div>
                    <label htmlFor="message" className="block text-sm font-medium">Anything else we should know <span className="font-normal text-slate">(optional)</span></label>
                    <textarea id="message" name="message" rows={4} defaultValue={v.message} className={inputCls} />
                </div>

                <div>
                    <label className="flex items-start gap-3 text-sm">
                        <input type="checkbox" name="consent" required defaultChecked={v.consent === "on"} aria-invalid={e.consent ? true : undefined} className="mt-1 h-4 w-4 accent-[var(--color-verdigris)]" />
                        <span>I agree to {SITE.shortName} collecting my details to respond to this enquiry, as described in the <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.</span>
                    </label>
                    {e.consent && <p className="mt-1 text-sm text-red-700 dark:text-red-300">{e.consent}</p>}
                </div>

                <button
                    type="submit" disabled={pending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-chalk transition-colors hover:bg-ink-soft disabled:opacity-70"
                >
                    {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {pending ? "Sending…" : "Send enquiry"}
                </button>
            </form>
        </div>
    );
}