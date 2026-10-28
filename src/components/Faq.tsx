import { Plus } from "lucide-react";

export function Faq({ heading = "Common questions", items }: { heading?: string; items: { q: string; a: string }[] }) {
    return (
        <section aria-labelledby="faq-heading" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
            <h2 id="faq-heading" className="text-3xl font-semibold sm:text-4xl">{heading}</h2>
            <div className="glass-strong mt-8 divide-y divide-ink/10 rounded-card px-6 sm:px-8">
                {items.map((it) => (
                    <details key={it.q} className="group py-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-medium [&::-webkit-details-marker]:hidden">
                            {it.q}
                            <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                        </summary>
                        <p className="mt-3 max-w-2xl text-slate">{it.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
