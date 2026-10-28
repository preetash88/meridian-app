import type { ReactNode } from "react";
import { MeridianArcs } from "./MeridianArcs";

export function PageHero({ title, intro, children }: { title: string; intro: string; children?: ReactNode }) {
    return (
        <section className="relative isolate overflow-hidden">
            <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10" />
            <MeridianArcs className="absolute -right-32 -top-20 -z-10 hidden h-[30rem] w-[30rem] md:block" />
            <div className="mx-auto max-w-(--container-page) px-5 pb-16 pt-16 sm:px-8 lg:pb-24 lg:pt-24">
                <h1 className="max-w-3xl text-4xl font-semibold sm:text-5xl lg:text-6xl">{title}</h1>
                <p className="mt-6 max-w-2xl text-lg text-slate">{intro}</p>
                {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
            </div>
        </section>
    );
}
