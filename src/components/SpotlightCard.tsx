"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import clsx from "clsx";

/** Glass card with a soft glow that follows the pointer. Updates CSS variables directly, no re-renders. */
export function SpotlightCard({
                                  children,
                                  className,
                                  strong = false,
                              }: {
    children: ReactNode;
    className?: string;
    strong?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    function onMove(e: PointerEvent<HTMLDivElement>) {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }

    return (
        <div
            ref={ref}
            onPointerMove={onMove}
            className={clsx("spotlight rounded-card transition-transform duration-300 hover:-translate-y-1", strong ? "glass-strong" : "glass", className)}
        >
            {children}
        </div>
    );
}