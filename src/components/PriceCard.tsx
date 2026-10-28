import { Check } from "lucide-react";
import { ButtonLink } from "./Button";

export function PriceCard({
                              title, price, unit, includes, note, href, cta,
                          }: { title: string; price: string; unit: string; includes: readonly string[]; note?: string; href: string; cta: string }) {
    return (
        <div className="glass-strong rounded-card p-8 sm:p-10">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">{price}</span>
                <span className="text-slate">{unit}</span>
            </p>
            <ul className="mt-7 space-y-3">
                {includes.map((i) => (
                    <li key={i} className="flex gap-3 text-[0.97rem]">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-verdigris" strokeWidth={3} aria-hidden="true" />
                        {i}
                    </li>
                ))}
            </ul>
            {note && <p className="mt-6 text-sm text-slate">{note}</p>}
            <ButtonLink href={href} className="mt-8">{cta}</ButtonLink>
        </div>
    );
}
