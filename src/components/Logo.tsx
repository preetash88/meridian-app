import Link from "next/link";
import { SITE } from "@/lib/site";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="6.2" ry="14.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 16h29" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="1.5" r="2.2" fill="var(--color-verdigris-bright)" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className={`inline-flex items-center gap-2.5 ${light ? "text-paper" : "text-ink"}`}
    >
      <LogoMark />
      <span className="font-display text-[1.35rem] font-semibold tracking-tight">{SITE.shortName}</span>
    </Link>
  );
}
