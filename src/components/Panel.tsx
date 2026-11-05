import clsx from "clsx";
import type { ReactNode } from "react";

/** A full-width section band. Colours come from the theme, so light and dark match everywhere. */
export function Panel({
                          children,
                          className,
                          labelledBy,
                          tint = false,
                      }: {
    children: ReactNode;
    className?: string;
    labelledBy?: string;
    /** Adds a subtle tinted background, to alternate with plain sections. */
    tint?: boolean;
}) {
    return (
        <section aria-labelledby={labelledBy} className={clsx("defer relative", tint && "band-tint", className)}>
            {children}
        </section>
    );
}