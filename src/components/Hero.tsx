"use client";

import {motion} from "motion/react";
import {useEffect, useRef} from "react";
import {ArrowRight, ChevronDown} from "lucide-react";
import Link from "next/link";
import {ButtonLink} from "./Button";
import {GlobeScene} from "./GlobeScene";
import {HeroAssets} from "./HeroAssets";
import {HERO_SVH} from "@/lib/hero";
import {PRICING, SITE} from "@/lib/site";

const HEADLINE = "The right people, checked before you meet them.".split(" ");

/** The scroll position is exposed as --p (0 to 1); each element maps it to its own animation in CSS. */
const fadeIn = (from: number, speed: number) => `clamp(0, calc((var(--p) - ${from}) * ${speed}), 1)`;
const fadeOut = (from: number, speed: number) => `clamp(0, calc(1 - (var(--p) - ${from}) * ${speed}), 1)`;

function Offer({
                   tag,
                   price,
                   unit,
                   text,
                   href,
                   cta,
                   style,
                   className = "",
               }: {
    tag: string;
    price: string;
    unit: string;
    text: string;
    href: string;
    cta: string;
    style?: React.CSSProperties;
    className?: string;
}) {
    return (
        <div style={style}
             className={`glass-strong pointer-events-auto w-full min-w-0 max-w-[20rem] flex-1 rounded-2xl p-4 text-left sm:rounded-3xl sm:p-5 xl:flex-none ${className}`}>
            <span
                className="inline-block rounded-full bg-verdigris/15 px-2.5 py-1 text-[0.68rem] font-medium text-verdigris sm:px-3 sm:text-[0.72rem]">{tag}</span>
            <p className="mt-3 flex items-baseline gap-2">
                <span
                    className="font-display text-[1.5rem] font-semibold leading-none tracking-tight text-ink sm:text-[2.4rem]">{price}</span>
                <span className="text-[0.72rem] text-slate sm:text-sm">{unit}</span>
            </p>
            <p className="mt-2.5 hidden text-[0.84rem] leading-relaxed text-slate xl:block">{text}</p>
            <Link href={href}
                  className="group mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-ink xl:mt-4 xl:text-[0.88rem]">
                {cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"/>
            </Link>
        </div>
    );
}

export function Hero() {
    const wrap = useRef<HTMLElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const progress = useRef(0);

    // Scroll drives the whole scene. It is written straight to a CSS variable, so scrolling never re-renders React.
    useEffect(() => {
        const el = wrap.current;
        const st = stage.current;
        if (!el || !st) return;
        let raf = 0;
        const update = () => {
            raf = 0;
            const total = el.offsetHeight - window.innerHeight;
            const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(1, total)));
            progress.current = p;
            st.style.setProperty("--p", p.toFixed(4));
            st.dataset.phase = p < 0.3 ? "intro" : "story";
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, {passive: true});
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section ref={wrap} className="relative" style={{height: `${HERO_SVH}svh`}}>
            <div ref={stage} data-phase="intro" className="group/stage sticky top-0 h-svh overflow-hidden"
                 style={{["--p" as string]: 0}}>
                <div aria-hidden="true" className="hero-sky absolute inset-0"/>

                {/* The globe fills the whole stage. It rises, then rolls to the middle and zooms in as you scroll. */}
                <div className="absolute inset-0 z-10">
                    <GlobeScene progress={progress}/>
                </div>

                {/* Optional floating 3D images (configure in HeroAssets.tsx) */}
                <HeroAssets/>

                {/* Scene 1: the promise */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-28 text-center group-data-[phase=intro]/stage:pointer-events-auto sm:pt-32 lg:pt-[6.5rem]"
                    style={{opacity: fadeOut(0.05, 5), transform: "translate3d(0, calc(var(--p) * -60px), 0)"}}
                >
                    <h1 aria-label={HEADLINE.join(" ")}
                        className="text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.4rem] lg:text-[3.9rem]">
                        {HEADLINE.map((w, i) => (
                            <span key={i} aria-hidden="true"
                                  className="mr-[0.24em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                    className="text-fade inline-block"
                    initial={{y: "110%"}}
                    animate={{y: 0}}
                    transition={{duration: 0.5, delay: 0.05 + i * 0.045, ease: [0.2, 0.8, 0.2, 1]}}
                >
                  {w}
                </motion.span>
              </span>
                        ))}
                    </h1>

                    <motion.p
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.4, duration: 0.45, ease: [0.2, 0.8, 0.2, 1]}}
                        className="mt-5 max-w-xl text-[1rem] leading-relaxed text-slate sm:text-[1.05rem]"
                    >
                        {SITE.shortName} recruits across every industry in Australia and New Zealand. Every candidate we
                        introduce is
                        identity-checked, right-to-work verified and assessed for the role.
                    </motion.p>

                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5, duration: 0.45, ease: [0.2, 0.8, 0.2, 1]}}
                        className="mt-7 flex flex-wrap items-center justify-center gap-3"
                    >
                        <ButtonLink href="/get-started?type=employer" className="!px-7 !py-3.5">
                            Start hiring today
                        </ButtonLink>
                        <ButtonLink href="/get-started?type=candidate" variant="secondary" className="!px-7 !py-3.5">
                            Find a role
                        </ButtonLink>
                    </motion.div>
                </div>

                {/* soft shade so the second headline stays readable over the map */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-72 bg-gradient-to-b from-chalk via-chalk/75 to-transparent"
                    style={{opacity: fadeIn(0.15, 5)}}
                />

                {/* Scene 2: where we work */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 text-center sm:pt-32"
                    style={{
                        opacity: fadeIn(0.18, 6),
                        transform: "translate3d(0, calc((1 - clamp(0, (var(--p) - 0.18) * 6, 1)) * 24px), 0)"
                    }}
                >
                    <h2 className="text-fade text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl">Every
                        state. Every industry.</h2>
                    <p className="mt-3 max-w-md text-[0.98rem] text-slate">From Perth to Auckland, one consultant runs
                        your search from brief to offer.</p>
                </div>

                {/* Scene 3: the offers */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-row items-stretch justify-center gap-2.5 p-3 sm:gap-3 sm:p-6 xl:inset-0 xl:block xl:p-0">
                    <Offer
                        tag="For employers"
                        price={PRICING.employer.price}
                        unit={PRICING.employer.unit}
                        text="Search, five checks and a role-fit assessment included. One flat fee, nothing hidden."
                        href="/get-started?type=employer"
                        cta="Start hiring"
                        className="xl:absolute xl:bottom-[3%] xl:left-[3.5%]"
                        style={{
                            opacity: fadeIn(0.42, 7),
                            transform: "translate3d(calc((1 - clamp(0, (var(--p) - 0.42) * 7, 1)) * -40px), 0, 0)"
                        }}
                    />
                    <Offer
                        tag="For job seekers"
                        price={PRICING.candidate.price}
                        unit={PRICING.candidate.unit}
                        text="Resume, LinkedIn and skills guidance to get you noticed. Support, not a placement promise."
                        href="/get-started?type=candidate"
                        cta="Get started"
                        className="xl:absolute xl:right-[3.5%] xl:top-[24%]"
                        style={{
                            opacity: fadeIn(0.52, 7),
                            transform: "translate3d(calc((1 - clamp(0, (var(--p) - 0.52) * 7, 1)) * 40px), 0, 0)"
                        }}
                    />
                </div>

                {/* scroll hint */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-5 left-6 z-20 flex flex-col items-start gap-1 text-[0.72rem] font-medium tracking-wide text-slate sm:left-8"
                    style={{opacity: fadeOut(0, 10)}}
                >
                    Scroll to explore
                    <ChevronDown className="h-4 w-4 animate-bounce"/>
                </div>
            </div>
        </section>
    );
}