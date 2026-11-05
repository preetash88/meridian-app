import { ArrowRight, Building2, Check, UserRound } from "lucide-react";
import Link from "next/link";
import { Panel } from "./Panel";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { PRICING } from "@/lib/site";

type Plan = {
    icon: typeof Building2;
    tag: string;
    price: string;
    unit: string;
    headline: string;
    includes: readonly string[];
    note?: string;
    href: string;
    cta: string;
    primary?: boolean;
};

const PLANS: Plan[] = [
    {
        icon: Building2,
        tag: "For employers",
        price: PRICING.employer.price,
        unit: PRICING.employer.unit,
        headline: "Hire someone who has already cleared the checks.",
        includes: PRICING.employer.includes,
        href: "/get-started?type=employer",
        cta: "Start hiring",
        primary: true,
    },
    {
        icon: UserRound,
        tag: "For job seekers",
        price: PRICING.candidate.price,
        unit: PRICING.candidate.unit,
        headline: "Get ready for the role you actually want.",
        includes: PRICING.candidate.includes,
        note: PRICING.candidate.note,
        href: "/get-started?type=candidate",
        cta: "Get started",
    },
];

export function OffersPanel() {
    return (
        <Panel labelledBy="offers-heading">
            <div className="mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:py-28">
                <Reveal>
                    <h2 id="offers-heading" className="text-fade max-w-2xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
                        Simple, flat pricing. No surprises.
                    </h2>
                    <p className="mt-4 max-w-xl text-[1.02rem] text-ink/65">
                        One clear price for employers and one for job seekers, so you know exactly what you are getting before you start.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                    {PLANS.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <Reveal key={p.tag} delay={i * 0.12}>
                                <SpotlightCard className="flex h-full flex-col p-8 text-ink sm:p-10">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ink/10 px-3 py-1.5 text-sm font-medium text-verdigris">
                    <Icon className="h-4 w-4" aria-hidden="true" /> {p.tag}
                  </span>
                                    <p className="mt-6 flex items-baseline gap-3">
                                        <span className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">{p.price}</span>
                                        <span className="text-ink/60">{p.unit}</span>
                                    </p>
                                    <h3 className="mt-5 max-w-md text-xl font-medium text-ink">{p.headline}</h3>
                                    <ul className="mt-6 space-y-3">
                                        {p.includes.map((t) => (
                                            <li key={t} className="flex gap-3 text-[0.97rem] text-ink/75">
                                                <Check className="mt-1 h-4 w-4 shrink-0 text-verdigris" strokeWidth={3} aria-hidden="true" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    {p.note && <p className="mt-5 text-sm text-slate/80">{p.note}</p>}
                                    <div className="mt-auto pt-8">
                                        <Link
                                            href={p.href}
                                            className={
                                                p.primary
                                                    ? "btn-sheen inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-7 py-3.5 font-medium text-chalk transition-transform duration-300 hover:-translate-y-0.5"
                                                    : "glass inline-flex items-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5 hover:bg-ink/10"
                                            }
                                        >
                                            {p.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </Link>
                                    </div>
                                </SpotlightCard>
                            </Reveal>
                        );
                    })}
                </div>
                <p className="mt-6 text-xs 	text-slate/70">All prices are in Australian dollars.</p>
            </div>
        </Panel>
    );
}