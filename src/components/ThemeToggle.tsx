"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
    // null until mounted, so server and first client render match
    const [dark, setDark] = useState<boolean | null>(null);

    useEffect(() => {
        const root = document.documentElement;
        setDark(root.classList.contains("dark"));

        // Follow the system setting until the visitor makes an explicit choice
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onSystemChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem(STORAGE_KEY)) return;
            root.classList.toggle("dark", e.matches);
            setDark(e.matches);
        };
        mq.addEventListener("change", onSystemChange);
        return () => mq.removeEventListener("change", onSystemChange);
    }, []);

    function toggle() {
        const next = !document.documentElement.classList.contains("dark");
        const apply = () => {
            document.documentElement.classList.toggle("dark", next);
            setDark(next);
        };
        try {
            localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
        } catch {}

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduce && "startViewTransition" in document) {
            (document as Document & { startViewTransition: (cb: () => void) => unknown }).startViewTransition(apply);
        } else {
            apply();
        }
    }

    const label = dark === null ? "Toggle colour theme" : dark ? "Switch to light mode" : "Switch to dark mode";

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={label}
            aria-pressed={dark ?? undefined}
            className={`grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-ink/10 ${className}`}
        >
            {/* Both icons are in the HTML; CSS shows the right one, so there is no flash or mismatch */}
            <Sun className="hidden h-5 w-5 dark:block" aria-hidden="true" />
            <Moon className="h-5 w-5 dark:hidden" aria-hidden="true" />
        </button>
    );
}