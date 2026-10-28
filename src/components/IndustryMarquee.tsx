import { INDUSTRIES } from "@/lib/site";

export function IndustryMarquee() {
    const items = [...INDUSTRIES, ...INDUSTRIES];
    return (
        <section aria-label="Industries we recruit in" className="glass border-x-0 py-7">
            <p className="mb-5 text-center text-sm text-slate">Recruiting across {INDUSTRIES.length} industries and growing</p>
            <div className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
                <ul className="marquee-track flex w-max gap-12 pr-12">
                    {items.map((ind, i) => {
                        const Icon = ind.icon;
                        return (
                            <li key={`${ind.slug}-${i}`} aria-hidden={i >= INDUSTRIES.length} className="flex items-center gap-2.5 whitespace-nowrap text-ink/70">
                                <Icon className="h-5 w-5 text-verdigris" aria-hidden="true" />
                                <span className="font-display text-lg font-medium">{ind.name}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
