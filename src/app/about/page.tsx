import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
    title: "About",
    description: `About ${SITE.name}: recruitment for every industry, built in Australia.`,
    alternates: { canonical: "/about" },
};

const PRINCIPLES = [
    { title: "Check first, introduce second", body: "We verify identity, right to work, qualifications and criminal history (with consent) and assess role fit before anyone is put forward." },
    { title: "One standard, every industry", body: "A nurse, an electrician and an analyst all go through the same process. Employers get the same quality of shortlist whatever they hire for." },
    { title: "Honest about what we can promise", body: "We tell job seekers plainly what our support is and isn't. We don't guarantee placements, and we don't pad shortlists." },
];

export default function About() {
    return (
        <>
            <PageHero
                title="Recruitment that does the checking before the introduction."
                intro={`${SITE.shortName} is a general recruitment agency starting in Australia. We built it around one idea: employers shouldn't have to wade through unchecked candidates, and job seekers deserve a straight answer.`}
            />
            <section className="mx-auto max-w-(--container-page) px-5 pb-20 sm:px-8 lg:pb-28">
                <h2 className="text-3xl font-semibold sm:text-4xl">How we work</h2>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                    {PRINCIPLES.map((p) => (
                        <article key={p.title} className="glass rounded-card p-7">
                            <h3 className="text-xl font-semibold">{p.title}</h3>
                            <p className="mt-3 text-slate">{p.body}</p>
                        </article>
                    ))}
                </div>
            </section>
            <CtaBand />
        </>
    );
}
