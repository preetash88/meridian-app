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
            <div className="mx-auto max-w-(--container-page) px-6 py-20 sm:px-10 lg:py-28">
                <Reveal>
                    <h2 id="offers-heading" className="text-fade max-w-2xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
                        Simple, flat pricing. No surprises.
                    </h2>
                    <p className="mt-4 max-w-xl text-[1.02rem] text-paper/65">
                        One clear price for employers and one for job seekers, so you know exactly what you are getting before you start.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                    {PLANS.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <Reveal key={p.tag} delay={i * 0.12}>
                                <SpotlightCard dark className="flex h-full flex-col p-8 text-paper sm:p-10">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 text-sm font-medium text-verdigris-bright">
                    <Icon className="h-4 w-4" aria-hidden="true" /> {p.tag}
                  </span>
                                    <p className="mt-6 flex items-baseline gap-3">
                                        <span className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">{p.price}</span>
                                        <span className="text-paper/60">{p.unit}</span>
                                    </p>
                                    <h3 className="mt-5 max-w-md text-xl font-medium text-paper">{p.headline}</h3>
                                    <ul className="mt-6 space-y-3">
                                        {p.includes.map((t) => (
                                            <li key={t} className="flex gap-3 text-[0.97rem] text-paper/75">
                                                <Check className="mt-1 h-4 w-4 shrink-0 text-verdigris-bright" strokeWidth={3} aria-hidden="true" />
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                    {p.note && <p className="mt-5 text-sm text-paper/50">{p.note}</p>}
                                    <div className="mt-auto pt-8">
                                        <Link
                                            href={p.href}
                                            className={
                                                p.primary
                                                    ? "btn-sheen inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-paper px-7 py-3.5 font-medium text-night transition-transform duration-300 hover:-translate-y-0.5"
                                                    : "glass-dark inline-flex items-center gap-2 whitespace-nowrap rounded-full px-7 py-3.5 font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 hover:bg-paper/15"
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
                <p className="mt-6 text-xs text-paper/45">All prices are in Australian dollars.</p>
            </div>
        </Panel>
    );
}