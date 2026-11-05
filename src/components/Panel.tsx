import clsx from "clsx";
import type { ReactNode } from "react";

/** A framed dark section, the same look as the hero. Content inside uses the fixed light-on-dark colours. */
export function Panel({
                          children,
                          className,
                          labelledBy,
                      }: {
    children: ReactNode;
    className?: string;
    labelledBy?: string;
}) {
    return (
        <section aria-labelledby={labelledBy} className="defer p-3 sm:p-4">
            <div className={clsx("panel-frame relative isolate overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]", className)}>
                {children}
            </div>
        </section>
    );
}