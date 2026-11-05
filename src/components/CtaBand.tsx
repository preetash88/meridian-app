import { ButtonLink } from "./Button";
import { MeridianArcs } from "./MeridianArcs";
import { Reveal } from "./Reveal";
import { SITE } from "@/lib/site";

export function CtaBand({
                            heading = "Tell us who you're looking for, or what you're looking for.",
                            body = `Send a short enquiry and we'll reply within ${SITE.responseTime}.`,
                        }: { heading?: string; body?: string }) {
    return (
        <section className="defer px-5 pb-20 sm:px-8 lg:pb-28">
            <Reveal>
                <div className="beam glass-strong relative isolate mx-auto max-w-(--container-page) overflow-hidden rounded-[2rem] px-8 py-16 sm:px-14 lg:py-20">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10"
                        style={{
                            background:
                                "radial-gradient(34rem 22rem at 100% 0%, color-mix(in srgb, var(--c-verdigris) 22%, transparent), transparent 65%), radial-gradient(30rem 20rem at 0% 100%, color-mix(in srgb, #6a5ce6 16%, transparent), transparent 65%)",
                        }}
                    />
                    <MeridianArcs className="absolute -right-24 -top-24 -z-10 h-[34rem] w-[34rem] opacity-80" />
                    <h2 className="text-fade max-w-2xl text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{heading}</h2>
                    <p className="mt-5 max-w-lg text-lg text-slate">{body}</p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <ButtonLink href="/get-started?type=employer">I'm hiring</ButtonLink>
                        <ButtonLink href="/get-started?type=candidate" variant="secondary">I'm looking for work</ButtonLink>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}