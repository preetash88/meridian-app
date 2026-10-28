"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Check } from "lucide-react";
import { CHECKS } from "@/lib/site";

function VisualChecks() {
  return (
      <ul className="space-y-3">
        {CHECKS.map((c) => (
            <li key={c} className="flex items-center gap-3 rounded-tile border border-surface-line bg-surface/70 px-4 py-3 text-[0.95rem]">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-verdigris text-on-accent">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          </span>
              {c}
            </li>
        ))}
      </ul>
  );
}

function VisualOneContact() {
  const dots = [
    [30, 40], [30, 100], [30, 160], [30, 220], [30, 280],
  ];
  return (
      <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-sm" role="img" aria-label="Many industries leading to one consultant">
        {dots.map(([x, y]) => (
            <g key={y}>
              <path d={`M${x} ${y} C 150 ${y}, 150 160, 250 160`} fill="none" stroke="var(--color-verdigris)" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 5" />
              <circle cx={x} cy={y} r="7" fill="var(--color-ink)" />
            </g>
        ))}
        <circle cx="262" cy="160" r="38" fill="var(--color-verdigris)" />
        <circle cx="262" cy="160" r="38" fill="none" stroke="var(--color-verdigris)" strokeOpacity="0.25" strokeWidth="12" />
        <text x="262" y="166" textAnchor="middle" fontSize="15" fontWeight="600" fill="var(--color-on-accent)" fontFamily="var(--font-display)">You</text>
      </svg>
  );
}

function VisualFit() {
  const rows = [
    ["Skills", 86],
    ["Experience", 74],
    ["Working style", 92],
    ["Motivation", 80],
  ] as const;
  return (
      <div className="space-y-5 rounded-card border border-surface-line bg-surface/70 p-6">
        <div>
          <p className="font-display text-lg font-semibold">Role-fit assessment</p>
          <p className="text-sm text-slate">Illustrative example</p>
        </div>
        {rows.map(([label, v]) => (
            <div key={label}>
              <div className="mb-1.5 text-sm text-slate">{label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-verdigris" style={{ width: `${v}%` }} />
              </div>
            </div>
        ))}
      </div>
  );
}

const PANELS = [
  {
    title: "Vetted before you meet them",
    body: "Identity, right to work, qualifications and criminal history (with the candidate's consent) are checked before we put anyone forward. You spend interview time on people who have already cleared the basics.",
    visual: <VisualChecks />,
  },
  {
    title: "One consultant, every industry",
    body: "You deal with one person from the first brief to the signed offer, whether you are hiring a site supervisor, a nurse or a financial analyst. No hand-offs, no repeating yourself.",
    visual: <VisualOneContact />,
  },
  {
    title: "Assessed for the role, not just the CV",
    body: "Every candidate completes a role-fit assessment, so you can see how they match the job and the team, not only how well they present on paper.",
    visual: <VisualFit />,
  },
] as const;

export function Offer() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(PANELS.length - 1, Math.max(0, Math.floor(v * PANELS.length)));
    setActive(i);
  });

  return (
      <section aria-labelledby="offer-heading">
        {/* Mobile and tablet: simple stack. Desktop: pinned, content swaps as you scroll. */}
        <div ref={ref} className="lg:h-[300vh]">
          <div className="mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
            <div className="grid w-full gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="self-center">
                <h2 id="offer-heading" className="text-4xl font-semibold sm:text-5xl">
                  Hiring, handled from brief to offer.
                </h2>
                <p className="mt-5 max-w-md text-lg text-slate">
                  Custom recruitment for your role, with the checking done up front so your time goes on the right conversations.
                </p>
                <div className="mt-10 hidden gap-2 lg:flex" aria-hidden="true">
                  {PANELS.map((p, i) => (
                      <span key={p.title} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                    <motion.span
                        className="block h-full bg-verdigris"
                        initial={false}
                        animate={{ width: i <= active ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </span>
                  ))}
                </div>
              </div>

              {/* Stack on small screens */}
              <div className="space-y-6 lg:hidden">
                {PANELS.map((p) => (
                    <article key={p.title} className="glass-strong rounded-card p-6 sm:p-8">
                      <h3 className="text-2xl font-semibold">{p.title}</h3>
                      <p className="mt-3 text-slate">{p.body}</p>
                      <div className="mt-6">{p.visual}</div>
                    </article>
                ))}
              </div>

              {/* Pinned on desktop */}
              <div className="relative hidden min-h-[30rem] lg:block">
                {PANELS.map((p, i) => (
                    <motion.article
                        key={p.title}
                        aria-hidden={i !== active}
                        initial={false}
                        animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -24 : 24 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="absolute inset-0 grid grid-cols-[1fr_1fr] items-center gap-8 glass-strong rounded-card p-10"
                        style={{ pointerEvents: i === active ? "auto" : "none" }}
                    >
                      <div>
                        <h3 className="text-3xl font-semibold">{p.title}</h3>
                        <p className="mt-4 text-slate">{p.body}</p>
                      </div>
                      <div>{p.visual}</div>
                    </motion.article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
