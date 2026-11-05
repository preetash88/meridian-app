import { BadgeCheck, Fingerprint, FileSearch, GraduationCap, Target } from "lucide-react";
import clsx from "clsx";
import { Panel } from "./Panel";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

const TILES = [
    { icon: Fingerprint, title: "Identity confirmed", body: "We verify who the candidate is before anything else happens.", span: "lg:col-span-3" },
    { icon: BadgeCheck, title: "Right to work verified", body: "Work rights are confirmed before any introduction, so there are no surprises at offer stage.", span: "lg:col-span-3" },
    { icon: GraduationCap, title: "Qualifications checked", body: "Degrees, licences and tickets are confirmed, not assumed.", span: "lg:col-span-2" },
    { icon: FileSearch, title: "Criminal history checked, with consent", body: "Only ever run with the candidate's consent.", span: "lg:col-span-2" },
    { icon: Target, title: "Role fit assessed", body: "Every candidate completes an assessment for your specific role.", span: "lg:col-span-2" },
];

export function ChecksPanel() {
    return (
        <Panel labelledBy="checks-heading" tint>
            <div className="mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:py-28">
                <Reveal>
                    <h2 id="checks-heading" className="text-fade max-w-2xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
                        Five checks before any introduction.
                    </h2>
                    <p className="mt-4 max-w-xl text-[1.02rem] text-ink/65">
                        You spend interview time on people who have already cleared the basics, in every industry we cover.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {TILES.map((t, i) => {
                        const Icon = t.icon;
                        return (
                            <Reveal key={t.title} delay={i * 0.07} className={clsx(t.span)}>
                                <SpotlightCard className="group relative h-full overflow-hidden p-7 text-ink">
                                    <Icon
                                        className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-ink/[0.05] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                                        aria-hidden="true"
                                    />
                                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-verdigris/15 text-verdigris">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                                    <h3 className="relative mt-6 text-xl font-semibold">{t.title}</h3>
                                    <p className="relative mt-2 max-w-sm text-[0.95rem] text-ink/65">{t.body}</p>
                                </SpotlightCard>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </Panel>
    );
}