import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { INDUSTRIES } from "@/lib/site";

export const metadata: Metadata = {
    title: "Industries we recruit in",
    description: "Meridian recruits across healthcare, hospitality, construction, technology, finance, logistics, retail, education, engineering and office roles in Australia.",
    alternates: { canonical: "/industries" },
};

export default function Industries() {
    return (
        <>
            <PageHero title="Every industry, one standard of checking." intro="Whether you're hiring a site manager or a data analyst, the process and the checks are the same. Here are the sectors we recruit in today." />
            <section className="mx-auto max-w-(--container-page) px-5 pb-20 sm:px-8 lg:pb-28">
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {INDUSTRIES.map((ind) => {
                        const Icon = ind.icon;
                        return (
                            <li key={ind.slug}>
                                <Link href={`/get-started?type=employer&industry=${ind.slug}`} className="glass group flex h-full flex-col rounded-card p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-surface/80">
                                    <span className="grid h-12 w-12 place-items-center rounded-tile bg-sage text-verdigris"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                                    <h2 className="mt-6 text-2xl font-semibold">{ind.name}</h2>
                                    <p className="mt-2 flex-1 text-slate">{ind.roles}</p>
                                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium">Hire in this industry <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
            <CtaBand />
        </>
    );
}
