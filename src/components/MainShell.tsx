"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The header floats over the page, so every page except the home hero needs space beneath it. */
export function MainShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    return (
        <main id="main" className={pathname === "/" ? "" : "pt-20 sm:pt-24"}>
            {children}
        </main>
    );
}