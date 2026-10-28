import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/Button";
import { PriceCard } from "@/components/PriceCard";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { CtaBand } from "@/components/CtaBand";
import { CHECKS, PRICING } from "@/lib/site";
import { Check } from "lucide-react";

export const metadata: Metadata = {
    title: "Hire with Meridian",
    description: "Recruitment across every industry in Australia, with identity, right-to-work, qualification and criminal history checks and a role-fit assessment on every candidate.",
    alternates: { canonical: "/employers" },
};

export default function Employers() {
    return (
        <>
            <PageHero
                title="Hire people who have already cleared the checks."
                intro="One consultant runs your search from brief to offer. You meet a shortlist that has been verified and assessed for the role, not a stack of unchecked resumes."
            >
                <ButtonLink href="/get-started?type=employer">Send a brief</ButtonLink>
            </PageHero>

            <section className="mx-auto grid max-w-(--container-page) gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-24">
                <div>
                    <h2 className="text-3xl font-semibold sm:text-4xl">What every shortlisted candidate has been through</h2>
                    <p className="mt-4 text-slate">Criminal history checks are only run with the candidate's consent.</p>
                </div>
                <ul className="space-y-3">
                    {CHECKS.map((c) => (
                        <li key={c} className="flex items-center gap-3 glass rounded-tile px-5 py-4">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-verdigris text-on-accent"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /></span>
                            {c}
                        </li>
                    ))}
                </ul>
            </section>

            <Process heading="From brief to hire" initial="employer" showTabs={false} />

            <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
                <h2 className="mb-8 text-3xl font-semibold sm:text-4xl">Simple, flat pricing</h2>
                <PriceCard title="Recruiter package" {...PRICING.employer} href="/get-started?type=employer" cta="Send a brief" />
            </section>

            <Faq items={[
                { q: "Which industries do you recruit in?", a: "All of them. We cover healthcare, hospitality, construction, technology, finance, logistics, retail, education, engineering and office roles, and we're happy to talk about others." },
                { q: "What does a criminal history check involve?", a: "We only run it with the candidate's consent, and as part of the same checking process every candidate goes through before introduction." },
                { q: "How quickly will you respond?", a: "We reply to every brief within one business day." },
                { q: "Where do you recruit?", a: "We are starting in Australia and plan to expand over time." },
            ]} />
            <CtaBand />
        </>
    );
}
