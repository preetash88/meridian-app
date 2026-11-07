"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ButtonLink } from "./Button";
import { NAV_LINKS } from "@/lib/site";

const LINKS = [{ label: "Home", href: "/" }, ...NAV_LINKS];

export function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hover, setHover] = useState<string | null>(null);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // On the home hero the header floats over the scene; once you scroll (or on other pages) it becomes a frosted bar.
    const bar = !isHome || scrolled;
    const activeHref = LINKS.find((l) => (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)))?.href;
    const highlighted = hover ?? activeHref;

    return (
        <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-5 sm:px-8 sm:pt-6">
            <div
                className={clsx(
                    "pointer-events-auto mx-auto grid max-w-(--container-page) grid-cols-[auto_1fr] items-center rounded-full px-2 py-1.5 transition-all duration-200 lg:grid-cols-[1fr_auto_1fr] sm:px-3",
                    bar ? "glass-strong frost" : "bg-transparent",
                )}
            >
                <div className="pl-3 sm:pl-2">
                    <Logo />
                </div>

                <nav aria-label="Main" onMouseLeave={() => setHover(null)} className={clsx("hidden items-center gap-0.5 rounded-full p-1 lg:flex", !bar && "glass frost")}>
                    {LINKS.map((l) => {
                        const active = l.href === activeHref;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                aria-current={active ? "page" : undefined}
                                onMouseEnter={() => setHover(l.href)}
                                onFocus={() => setHover(l.href)}
                                className={clsx("relative whitespace-nowrap rounded-full px-4 py-2 text-[0.92rem] transition-colors", active ? "text-ink" : "text-slate hover:text-ink")}
                            >
                                {highlighted === l.href && (
                                    <motion.span layoutId="nav-highlight" className="absolute inset-0 -z-10 rounded-full bg-ink/10" transition={{ type: "spring", stiffness: 600, damping: 40 }} />
                                )}
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-1.5">
                    {/* wrapped so "hidden" isn't overridden by the button's own display class */}
                    <div className="hidden lg:block">
                        <ButtonLink href="/login" variant="secondary" className="!px-5 !py-2.5">
                            Log in
                        </ButtonLink>
                    </div>
                    <div className="hidden lg:block">
                        <ButtonLink href="/get-started" className="!px-5 !py-2.5">
                            Get started
                        </ButtonLink>
                    </div>
                    <button
                        type="button"
                        className="grid h-10 w-10 place-items-center rounded-full text-ink lg:hidden"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((v) => !v)}
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {open && (
                <div id="mobile-menu" className="glass-strong frost pointer-events-auto mx-auto mt-2 max-w-(--container-page) rounded-card p-6 lg:hidden">
                    <nav aria-label="Mobile" className="flex flex-col">
                        {LINKS.map((l) => (
                            <Link key={l.href} href={l.href} className="border-b border-ink/10 py-3.5 font-display text-2xl font-medium">
                                {l.label}
                            </Link>
                        ))}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <ButtonLink href="/login" variant="secondary">
                                Log in
                            </ButtonLink>
                            <ButtonLink href="/get-started">Get started</ButtonLink>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}