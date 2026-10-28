"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/site";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function IndustryCarousel() {
  const scroller = useRef<HTMLUListElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
      <section aria-labelledby="industries-heading" className="defer pb-20 lg:pb-28">
        <div className="mx-auto flex max-w-(--container-page) flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
          <Reveal>
            <h2 id="industries-heading" className="text-4xl font-semibold sm:text-5xl">One agency, every industry.</h2>
            <p className="mt-4 max-w-xl text-lg text-slate">Whatever the sector, the process and the standard of checking stay the same.</p>
          </Reveal>
          <div className="flex gap-2">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous industries" className="glass grid h-11 w-11 place-items-center rounded-full transition-all hover:-translate-y-0.5 hover:bg-white/80">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Next industries" className="glass grid h-11 w-11 place-items-center rounded-full transition-all hover:-translate-y-0.5 hover:bg-white/80">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ul ref={scroller} className="no-scrollbar carousel-pad mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-4" aria-label="Industries">
          {INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            return (
                <li key={ind.slug} className="w-[17.5rem] shrink-0 snap-start">
                  <SpotlightCard className="h-full">
                    <Link href={`/get-started?type=employer&industry=${ind.slug}`} className="group flex h-full min-h-[15rem] flex-col justify-between p-6">
                      <div>
                    <span className="grid h-12 w-12 place-items-center rounded-tile bg-sage text-verdigris transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                        <h3 className="mt-6 text-xl font-semibold">{ind.name}</h3>
                        <p className="mt-2 text-[0.95rem] text-slate">{ind.roles}</p>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium">
                    Hire in this industry
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                    </Link>
                  </SpotlightCard>
                </li>
            );
          })}
        </ul>
      </section>
  );
}