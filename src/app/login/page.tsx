import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "Log in",
    description: `Member sign-in for ${SITE.name} is coming soon.`,
    robots: { index: false, follow: false },
};

export default function Login() {
    return (
        <section className="mx-auto flex max-w-xl px-5 py-16 sm:px-8 lg:py-24">
            <div className="glass-strong w-full rounded-card p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage text-verdigris">
          <LockKeyhole className="h-7 w-7" aria-hidden="true" />
        </span>
                <h1 className="mt-6 text-4xl font-semibold">Member sign‑in is on its way.</h1>
                <p className="mx-auto mt-4 max-w-md text-slate">
                    Employers and job seekers will soon be able to log in to track roles, introductions and subscriptions. Until then, send us an enquiry and
                    we'll reply within {SITE.responseTime}.
                </p>
                <ButtonLink href="/get-started" className="mt-8">
                    Send an enquiry
                </ButtonLink>
            </div>
        </section>
    );
}