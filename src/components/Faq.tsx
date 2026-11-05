import { Plus } from "lucide-react";
import { Panel } from "./Panel";

type Item = { q: string; a: string };

function List({ items, dark }: { items: Item[]; dark: boolean }) {
    return (
        <div className={dark ? "glass-dark mt-8 divide-y divide-paper/10 rounded-card px-6 text-paper sm:px-8" : "glass-strong mt-8 divide-y divide-ink/10 rounded-card px-6 sm:px-8"}>
            {items.map((it) => (
                <details key={it.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-medium [&::-webkit-details-marker]:hidden">
                        {it.q}
                        <Plus className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <p className={dark ? "mt-3 max-w-2xl text-paper/65" : "mt-3 max-w-2xl text-slate"}>{it.a}</p>
                </details>
            ))}
        </div>
    );
}

/** tone="dark" renders it as a framed dark panel (used on the home page). */
export function Faq({ heading = "Common questions", items, tone = "light" }: { heading?: string; items: Item[]; tone?: "light" | "dark" }) {
    if (tone === "dark") {
        return (
            <Panel labelledBy="faq-heading">
                <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:py-28">
                    <h2 id="faq-heading" className="text-fade text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
                        {heading}
                    </h2>
                    <List items={items} dark />
                </div>
            </Panel>
        );
    }
    return (
        <section aria-labelledby="faq-heading" className="mx-auto max-w-4xl px-5 py-16 sm:px-8 lg:py-24">
            <h2 id="faq-heading" className="text-3xl font-semibold sm:text-4xl">
                {heading}
            </h2>
            <List items={items} dark={false} />
        </section>
    );
}