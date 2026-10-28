import { ArrowUpRight, Building2, Check, UserRound } from "lucide-react";
import { ButtonLink } from "./Button";
import { MeridianArcs } from "./MeridianArcs";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";
import { PRICING } from "@/lib/site";

const EMPLOYER = [
    "A shortlist that has cleared five checks",
    "One consultant from brief to offer",
    `${PRICING.employer.price} ${PRICING.employer.unit}, nothing hidden`,
];
const CANDIDATE = [
    "Resume building and LinkedIn optimisation",
    "Skills guidance for the roles you want",
    `${PRICING.candidate.price} ${PRICING.candidate.unit}`,
];

export function Audience() {
    return (
        <section aria-labelledby="audience-heading" className="defer mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:py-28">
            <Reveal>
                <h2 id="audience-heading" className="max-w-2xl text-4xl font-semibold sm:text-5xl">
                    Two ways in, one standard of care.
                </h2>
                <p className="mt-4 max-w-xl text-lg text-slate">Whether you are hiring or looking, you deal with a real person who owns the outcome.</p>
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
                <Reveal>
                    <SpotlightCard strong className="relative h-full overflow-hidden p-8 sm:p-10">
                        <MeridianArcs className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 opacity-70" />
                        <span className="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1.5 text-sm font-medium text-verdigris">
              <Building2 className="h-4 w-4" aria-hidden="true" /> For employers
            </span>
                        <h3 className="mt-6 text-3xl font-semibold">Hire with confidence.</h3>
                        <p className="mt-3 max-w-md text-slate">Tell us the role. We search, check and assess, then introduce only the people worth your time.</p>
                        <ul className="mt-7 space-y-3">
                            {EMPLOYER.map((t) => (
                                <li key={t} className="flex gap-3">
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-verdigris" strokeWidth={3} aria-hidden="true" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                        <ButtonLink href="/employers" className="relative mt-9">
                            How hiring works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </ButtonLink>
                    </SpotlightCard>
                </Reveal>

                <Reveal delay={0.12}>
                    <SpotlightCard strong className="relative h-full overflow-hidden p-8 sm:p-10">
                        <MeridianArcs className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 opacity-70" />
                        <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-sm font-medium text-ink-soft">
              <UserRound className="h-4 w-4" aria-hidden="true" /> For job seekers
            </span>
                        <h3 className="mt-6 text-3xl font-semibold">Be ready when the right role appears.</h3>
                        <p className="mt-3 max-w-md text-slate">Sharpen how you present yourself, then get introduced to employers when a role fits.</p>
                        <ul className="mt-7 space-y-3">
                            {CANDIDATE.map((t) => (
                                <li key={t} className="flex gap-3">
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-verdigris" strokeWidth={3} aria-hidden="true" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                        <ButtonLink href="/job-seekers" variant="secondary" className="relative mt-9">
                            How support works <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </ButtonLink>
                    </SpotlightCard>
                </Reveal>
            </div>
        </section>
    );
}