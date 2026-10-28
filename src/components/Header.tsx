"use client";

import Link from "next/link";
import clsx from "clsx";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {Menu, X} from "lucide-react";
import {Logo} from "./Logo";
import {ButtonLink} from "./Button";
import {NAV_LINKS} from "@/lib/site";
import {ThemeToggle} from "./ThemeToggle";

export function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

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
        window.addEventListener("scroll", onScroll, {passive: true});
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
            <div
                className={clsx(
                    "mx-auto flex max-w-(--container-page) items-center justify-between rounded-full px-5 transition-all duration-300 sm:px-7",
                    scrolled ? "glass-strong frost h-14" : "glass frost h-[4.25rem]",
                )}
            >
                <Logo/>

                <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
                    {NAV_LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            aria-current={pathname === l.href ? "page" : undefined}
                            className="rounded-full px-4 py-2 text-[0.95rem] text-slate transition-colors hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink/5 aria-[current=page]:font-medium aria-[current=page]:text-ink"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <ThemeToggle className="ml-1"/>
                    <ButtonLink href="/get-started" className="ml-2 !py-2">
                        Get started
                    </ButtonLink>
                </nav>

                <button
                    type="button"
                    className="-mr-2 rounded-full p-2 md:hidden"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                </button>
            </div>

            {open && (
                <div id="mobile-menu"
                     className="glass-strong frost fixed inset-x-3 top-[5.25rem] z-30 rounded-card p-6 md:hidden">
                    <nav aria-label="Mobile" className="flex flex-col">
                        {NAV_LINKS.map((l) => (
                            <Link key={l.href} href={l.href}
                                  className="border-b border-ink/10 py-4 font-display text-2xl font-medium last:border-0">
                                {l.label}
                            </Link>
                        ))}
                        <div className="-mr-2 flex items-center md:hidden">
                            <ThemeToggle/>
                            <button
                                type="button"
                                className="rounded-full p-2"
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                                aria-controls="mobile-menu"
                                onClick={() => setOpen((v) => !v)}
                            >
                                {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}