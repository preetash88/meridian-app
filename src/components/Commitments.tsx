"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { SITE } from "@/lib/site";

const ITEMS = [
  { n: 5, label: "checks on every candidate", detail: "Identity, right to work, qualifications, criminal history and role fit." },
  { n: 1, label: "consultant from brief to offer", detail: "One person owns your search, whatever the industry." },
  { n: 1, label: "business day to reply", detail: `We respond to every enquiry within ${SITE.responseTime}.` },
  { n: 3, label: "months of candidate support", detail: "Resume, LinkedIn and skills guidance for job seekers." },
] as const;

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration: 1.3, ease: "easeOut" });
    return () => controls.stop();
  }, [inView, to, value]);

  return (
      <span ref={ref}>
      <span className="sr-only">{to}</span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0));
  const y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1));
  const y1 = cy + r * Math.sin(rad(a1));
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

function Ring({ segments }: { segments: number }) {
  const r = 52;
  const gap = 9;
  const common = {
    fill: "none",
    stroke: "var(--color-verdigris-bright)",
    strokeWidth: 3,
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-80px" },
  } as const;

  return (
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(243,245,243,0.12)" strokeWidth="3" />
        {segments === 1 ? (
            <motion.circle cx="60" cy="60" r={r} {...common} transition={{ delay: 0.15, duration: 1.1, ease: "easeOut" }} />
        ) : (
            Array.from({ length: segments }).map((_, i) => {
              const a0 = (360 / segments) * i + gap / 2;
              const a1 = (360 / segments) * (i + 1) - gap / 2;
              return (
                  <motion.path
                      key={i}
                      d={arc(60, 60, r, a0, a1)}
                      strokeLinecap="round"
                      {...common}
                      transition={{ delay: 0.15 + i * 0.18, duration: 0.6, ease: "easeOut" }}
                  />
              );
            })
        )}
      </svg>
  );
}

export function Commitments() {
  return (
      <section aria-labelledby="commit-heading" className="relative isolate overflow-hidden bg-night text-paper">
        {/* Static glows behind the glass cards. No animation, so no repaint cost. */}
        <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                  "radial-gradient(40rem 26rem at 12% 0%, rgba(76,192,168,0.22), transparent 65%), radial-gradient(38rem 26rem at 95% 100%, rgba(150,140,230,0.22), transparent 65%)",
            }}
        />
        <div className="mx-auto max-w-(--container-page) px-5 py-20 sm:px-8 lg:py-28">
          <h2 id="commit-heading" className="max-w-2xl text-4xl font-semibold sm:text-5xl">
            What you can count on, in numbers we can keep.
          </h2>
          <p className="mt-4 max-w-xl text-paper/65">
            Commitments, not claims. As Meridian grows, results from real placements will sit alongside them.
          </p>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ITEMS.map((it) => (
                <li key={it.label} className="glass-dark flex flex-col items-center rounded-card p-8 text-center transition-transform duration-300 hover:-translate-y-1 sm:items-start sm:text-left">
                  <div className="relative h-32 w-32">
                    <Ring segments={it.n} />
                    <span className="absolute inset-0 grid place-items-center font-display text-5xl font-semibold">
                  <CountUp to={it.n} />
                </span>
                  </div>
                  <p className="mt-6 font-display text-xl font-semibold">{it.label}</p>
                  <p className="mt-2 max-w-[16rem] text-[0.95rem] text-paper/65">{it.detail}</p>
                </li>
            ))}
          </ul>
        </div>
      </section>
  );
}