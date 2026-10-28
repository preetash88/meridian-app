"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import { SpotlightCard } from "./SpotlightCard";

const FLOWS = {
  employer: {
    label: "For employers",
    steps: [
      { title: "Tell us about the role", body: "Share the role, the team and what good looks like. We reply within one business day." },
      { title: "We search, check and shortlist", body: "You only see candidates who have cleared our identity, right-to-work, qualification and criminal history checks, and been assessed for the role." },
      { title: "You interview and hire", body: "Meet the shortlist, give feedback and make your offer. We coordinate the process with you." },
    ],
  },
  candidate: {
    label: "For job seekers",
    steps: [
      { title: "Tell us what you're after", body: "Share the role, industry, city and skills you are aiming for." },
      { title: "We sharpen your application", body: "Resume building, LinkedIn optimisation and skills guidance, so you present your best self to employers." },
      { title: "We introduce you to roles", body: "When a role fits, we put you forward. We can't promise a placement, but you will always know where you stand." },
    ],
  },
} as const;

type FlowKey = keyof typeof FLOWS;

export function Process({ heading = "How it works", initial = "employer", showTabs = true }: { heading?: string; initial?: FlowKey; showTabs?: boolean }) {
  const [flow, setFlow] = useState<FlowKey>(initial);
  const current = FLOWS[flow];

  return (
      <section aria-labelledby="process-heading" className="defer mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="process-heading" className="text-4xl font-semibold sm:text-5xl">{heading}</h2>

          {showTabs && (
              <div role="tablist" aria-label="Choose a path" className="glass relative inline-flex rounded-full p-1">
                {(Object.keys(FLOWS) as FlowKey[]).map((k) => (
                    <button
                        key={k}
                        role="tab"
                        id={`tab-${k}`}
                        aria-selected={flow === k}
                        aria-controls="process-panel"
                        onClick={() => setFlow(k)}
                        className={clsx(
                            "relative z-10 rounded-full px-5 py-2 text-[0.95rem] font-medium transition-colors",
                            flow === k ? "text-chalk" : "text-slate hover:text-ink",
                        )}
                    >
                      {flow === k && (
                          <motion.span layoutId="process-pill" className="absolute inset-0 -z-10 rounded-full bg-ink shadow-md" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                      )}
                      {FLOWS[k].label}
                    </button>
                ))}
              </div>
          )}
        </div>

        <ol id="process-panel" role="tabpanel" aria-labelledby={`tab-${flow}`} className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {current.steps.map((s, i) => (
              <motion.li
                  key={`${flow}-${s.title}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
              >
            <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-lg font-semibold text-chalk shadow-[0_0_0_6px_rgba(255,255,255,0.55)]">
              {i + 1}
            </span>
                {i < current.steps.length - 1 && (
                    <motion.span
                        aria-hidden="true"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.25, ease: "easeOut" }}
                        className="absolute left-14 right-[-1.5rem] top-[1.3rem] hidden origin-left border-t-2 border-dashed border-verdigris/50 md:block"
                    />
                )}
                <SpotlightCard className="mt-5 p-7">
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-3 text-[0.97rem] text-slate">{s.body}</p>
                </SpotlightCard>
              </motion.li>
          ))}
        </ol>
      </section>
  );
}