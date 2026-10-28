"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Check, Clock, Layers, ShieldCheck } from "lucide-react";
import type { PointerEvent } from "react";
import { ButtonLink } from "./Button";
import { MeridianArcs } from "./MeridianArcs";
import { CHECKS, INDUSTRIES, SITE } from "@/lib/site";

const HEADLINE = "The right people, checked before you meet them.".split(" ");

const FACTS = [
  { icon: ShieldCheck, text: "Checked first" },
  { icon: Layers, text: "Every industry" },
  { icon: Clock, text: `Reply in ${SITE.responseTime}` },
] as const;

const CHIPS = [
  { ind: INDUSTRIES[0], pos: "right-[-2%] top-[6%]", delay: 1.7, float: "0s" },
  { ind: INDUSTRIES[3], pos: "left-[-4%] top-[16%]", delay: 1.95, float: "-2s" },
  { ind: INDUSTRIES[1], pos: "right-[2%] bottom-[2%]", delay: 2.2, float: "-4s" },
] as const;

export function Hero() {
  // Pointer-driven tilt. Motion values update the transform directly, so there are no React re-renders.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 110, damping: 16 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), { stiffness: 110, damping: 16 });
  const arcX = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 60, damping: 20 });
  const arcY = useSpring(useTransform(py, [-0.5, 0.5], [-14, 14]), { stiffness: 60, damping: 20 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10" />

        <div className="mx-auto grid max-w-(--container-page) items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-28 lg:pt-20">
          <div>
            <h1 aria-label={HEADLINE.join(" ")} className="text-[2.7rem] font-semibold sm:text-6xl lg:text-[4.2rem]">
              {HEADLINE.map((w, i) => (
                  <span key={i} aria-hidden="true" className="mr-[0.25em] inline-block overflow-hidden pb-[0.12em] align-bottom">
                <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.75, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
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
                className="mt-6 max-w-xl text-lg text-slate"
            >
              {SITE.shortName} recruits across every industry in Australia. Every candidate we introduce has been identity-checked,
              right-to-work verified, qualification-checked and assessed for the role.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-9 flex flex-wrap gap-3"
            >
              <ButtonLink href="/get-started?type=employer">Hire talent</ButtonLink>
              <ButtonLink href="/get-started?type=candidate" variant="secondary">
                Find a role
              </ButtonLink>
            </motion.div>

            <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.15, duration: 0.6 }}
                className="mt-10 flex flex-wrap gap-2.5"
                aria-label="Highlights"
            >
              {FACTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink/80">
                    <Icon className="h-4 w-4 text-verdigris" aria-hidden="true" />
                    {text}
                  </li>
              ))}
            </motion.ul>
          </div>

          {/* The memorable moment: an example candidate card whose checks land one by one. */}
          <div
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              className="relative mx-auto w-full max-w-[34rem] py-10 sm:aspect-square sm:py-0"
          >
            <motion.div style={{ x: arcX, y: arcY }} className="absolute inset-0">
              <MeridianArcs className="h-full w-full" />
            </motion.div>

            {CHIPS.map(({ ind, pos, delay, float }) => {
              const Icon = ind.icon;
              return (
                  <div key={ind.slug} className={`float-y absolute z-10 hidden sm:block ${pos}`} style={{ animationDelay: float }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay, duration: 0.5, ease: "easeOut" }}
                        className="glass frost flex items-center gap-2 rounded-full py-2 pl-2.5 pr-4 text-sm font-medium"
                    >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-sage text-verdigris">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                      {ind.name.split(" and ")[0]}
                    </motion.div>
                  </div>
              );
            })}

            <motion.div
                style={{ rotateX, rotateY, transformPerspective: 1100 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
                className="glass-strong frost relative rounded-card p-6 sm:absolute sm:left-[2%] sm:right-[4%] sm:top-[27%] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold">Operations Manager</p>
                  <p className="text-sm text-slate">Brisbane, QLD</p>
                </div>
                <span className="rounded-full bg-sage px-3 py-1 text-xs font-medium text-verdigris">Shortlisted</span>
              </div>

              <ul className="mt-5 space-y-3">
                {CHECKS.map((c, i) => (
                    <motion.li
                        key={c}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + i * 0.28, duration: 0.35, ease: "easeOut" }}
                        className="flex items-center gap-3 text-[0.95rem]"
                    >
                      <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.95 + i * 0.28, type: "spring", stiffness: 500, damping: 18 }}
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verdigris text-white"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      </motion.span>
                      {c}
                    </motion.li>
                ))}
              </ul>
              <p className="mt-5 border-t border-ink/10 pt-3 text-xs text-slate">Example candidate card. Not a real person.</p>
            </motion.div>

            <div className="float-y absolute -bottom-3 left-[-2%] z-10 hidden sm:block" style={{ animationDelay: "-1s" }}>
              <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4, duration: 0.5, ease: "easeOut" }}
                  className="glass frost rounded-tile px-4 py-3 text-sm"
              >
                <p className="font-medium">Brief received</p>
                <p className="text-slate">We reply within {SITE.responseTime}.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
  );
}