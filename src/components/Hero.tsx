"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "./Button";
import { GlobeScene } from "./GlobeScene";
import { HERO_SVH } from "@/lib/hero";
import { PRICING, SITE } from "@/lib/site";

const HEADLINE = "The right people, checked before you meet them.".split(" ");

/** CSS-only helpers: the scroll position is exposed as --p (0 to 1) and each element maps it to its own animation. */
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
      <div style={style} className={`glass-dark frost pointer-events-auto w-full min-w-0 max-w-[20rem] flex-1 rounded-2xl p-4 text-left text-paper sm:rounded-3xl sm:p-5 xl:flex-none ${className}`}>
        <span className="inline-block rounded-full bg-paper/10 px-2.5 py-1 text-[0.68rem] font-medium text-verdigris-bright sm:px-3 sm:text-[0.72rem]">{tag}</span>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-[1.5rem] font-semibold leading-none tracking-tight sm:text-[2.4rem]">{price}</span>
          <span className="text-[0.72rem] text-paper/65 sm:text-sm">{unit}</span>
        </p>
        <p className="mt-2.5 hidden text-[0.84rem] leading-relaxed text-paper/65 xl:block">{text}</p>
        <Link href={href} className="group mt-3 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-paper xl:mt-4 xl:text-[0.88rem]">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
  );
}

export function Hero() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  // Scroll position drives everything in the scene. It is written straight to a CSS variable,
  // so scrolling never causes a React re-render.
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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
      <section ref={wrap} className="relative" style={{ height: `${HERO_SVH}svh` }}>
        <div ref={stage} data-phase="intro" className="group/stage sticky top-0 h-svh p-3 sm:p-4" style={{ ["--p" as string]: 0 }}>
          <div className="hero-frame relative isolate h-full overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
            <div aria-hidden="true" className="grain absolute inset-0 -z-10" />

            {/* The globe. It rises from below, then rolls to the centre and zooms in as you scroll. */}
            <div
                className="absolute left-1/2 z-10 aspect-square w-[108vmax] [--c0:1.03] [--c1:0.5]"
                style={{
                  top: "calc((var(--c0) + (var(--c1) - var(--c0)) * var(--p)) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
            >
              {/* The entrance animation lives on an inner wrapper so it can't override the positioning transform above */}
              <div className="globe-in h-full w-full">
                <GlobeScene progress={progress} />
              </div>
            </div>

            {/* Scene 1: the promise */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-28 text-center group-data-[phase=intro]/stage:pointer-events-auto sm:pt-32 lg:pt-[6.5rem]"
                style={{ opacity: fadeOut(0.06, 4.5), transform: "translate3d(0, calc(var(--p) * -70px), 0)" }}
            >
              <h1
                  aria-label={HEADLINE.join(" ")}
                  className="text-[2.5rem] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[3.4rem] lg:text-[3.9rem]"
              >
                {HEADLINE.map((w, i) => (
                    <span key={i} aria-hidden="true" className="mr-[0.24em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span
                      className="text-fade inline-block"
                      initial={{ y: "115%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}
                  </motion.span>
                </span>
                ))}
              </h1>

              <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.6 }}
                  className="mt-5 max-w-xl text-[1rem] leading-relaxed text-paper/70 sm:text-[1.05rem]"
              >
                {SITE.shortName} recruits across every industry in Australia and New Zealand. Every candidate we introduce is
                identity-checked, right-to-work verified and assessed for the role.
              </motion.p>

              <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="mt-7 flex flex-wrap items-center justify-center gap-3"
              >
                <ButtonLink href="/get-started?type=employer" variant="light" className="!px-7 !py-3.5">
                  Start hiring today
                </ButtonLink>
                <ButtonLink href="/get-started?type=candidate" variant="ghost-light" className="!px-7 !py-3.5">
                  Find a role
                </ButtonLink>
              </motion.div>
            </div>

            {/* Soft shade behind scene 2 so the headline stays readable over the map */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-56 bg-gradient-to-b from-[#04121a]/75 via-[#04121a]/35 to-transparent"
                style={{ opacity: fadeIn(0.2, 4) }}
            />

            {/* Scene 2: where we work */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 text-center sm:pt-32"
                style={{ opacity: fadeIn(0.22, 5), transform: "translate3d(0, calc((1 - clamp(0, (var(--p) - 0.22) * 5, 1)) * 30px), 0)" }}
            >
              <h2 className="text-fade text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl">Every state. Every industry.</h2>
              <p className="mt-3 max-w-md text-[0.98rem] text-paper/70">From Perth to Auckland, one consultant runs your search from brief to offer.</p>
            </div>

            {/* Scene 3: the offers */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-row items-stretch justify-center gap-2.5 p-3 sm:gap-3 sm:p-6 xl:inset-0 xl:block xl:p-0">
              <Offer
                  tag="For employers"
                  price={PRICING.employer.price}
                  unit={PRICING.employer.unit}
                  text="Search, five checks and a role-fit assessment included. One flat fee, nothing hidden."
                  href="/get-started?type=employer"
                  cta="Start hiring"
                  className="xl:absolute xl:bottom-[3%] xl:left-[3.5%]"
                  style={{ opacity: fadeIn(0.5, 6), transform: "translate3d(calc((1 - clamp(0, (var(--p) - 0.5) * 6, 1)) * -50px), 0, 0)" }}
              />
              <Offer
                  tag="For job seekers"
                  price={PRICING.candidate.price}
                  unit={PRICING.candidate.unit}
                  text="Resume, LinkedIn and skills guidance to get you noticed. Support, not a placement promise."
                  href="/get-started?type=candidate"
                  cta="Get started"
                  className="xl:absolute xl:right-[3.5%] xl:top-[24%]"
                  style={{ opacity: fadeIn(0.62, 6), transform: "translate3d(calc((1 - clamp(0, (var(--p) - 0.62) * 6, 1)) * 50px), 0, 0)" }}
              />
            </div>

            {/* Scroll hint */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 left-6 z-20 flex flex-col items-start gap-1 text-[0.72rem] font-medium tracking-wide text-paper/60 sm:left-8"
                style={{ opacity: fadeOut(0, 8) }}
            >
              Scroll to explore
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </div>
          </div>
        </div>
      </section>
  );
}