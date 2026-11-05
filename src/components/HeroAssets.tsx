"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroAsset = {
    src: string;
    srcLight: string;
    alt: string;
    width: number;
    height: number;
    side: "left" | "right";
    top: string;
    size: string;
    depth?: number;
};

export const HERO_ASSETS: HeroAsset[] = [
    {
        src: "/3d/shield.png",
        srcLight: "/3d/shield-light.png",
        alt: "Verified candidate shield",
        width: 1600,
        height: 1760,
        side: "right",
        top: "35%",
        size: "clamp(8rem, 11vw, 13rem)",
        depth: 1,
    },
    {
        src: "/3d/card.png",
        srcLight: "/3d/card-light.png",
        alt: "Candidate profile card",
        width: 2000,
        height: 1280,
        side: "left",
        top: "43%",
        size: "clamp(10rem, 14vw, 17rem)",
        depth: 0.7,
    },
];

export function HeroAssets() {
    const ref = useRef<HTMLDivElement>(null);
    const [dark, setDark] = useState(true);

    useEffect(() => {
        const sync = () => setDark(document.documentElement.classList.contains("dark"));
        sync();
        const mo = new MutationObserver(sync);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => mo.disconnect();
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el || !HERO_ASSETS.length) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let raf = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            if (!raf)
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    el.style.setProperty("--mx", x.toFixed(3));
                    el.style.setProperty("--my", y.toFixed(3));
                });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    if (!HERO_ASSETS.length) return null;

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[12] hidden lg:block"
            style={{ opacity: "clamp(0, calc(1 - var(--p) * 6), 1)" }}
        >
            {HERO_ASSETS.map((a, i) => {
                const d = a.depth ?? 1;
                return (
                    <div
                        key={a.src}
                        className="absolute"
                        style={{
                            top: a.top,
                            width: a.size,
                            ...(a.side === "left" ? { left: "6%" } : { right: "6%" }),
                            transform: `translate3d(calc(var(--mx, 0) * ${-28 * d}px), calc(var(--my, 0) * ${-20 * d}px + var(--p) * -140px), 0)`,
                        }}
                    >
                        <div className="hero-asset-in" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                            <div className="hero-float" style={{ animationDelay: `${i * 1.1}s` }}>
                                <Image
                                    src={dark ? a.src : a.srcLight}
                                    alt={a.alt}
                                    width={a.width}
                                    height={a.height}
                                    priority
                                    sizes="(min-width: 1024px) 16vw, 1px"
                                    className="h-auto w-full drop-shadow-[0_28px_36px_rgba(4,18,26,0.12)]"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}