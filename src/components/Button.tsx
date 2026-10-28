import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "light" | "ghost-light";

const styles: Record<Variant, string> = {
  primary:
      "btn-sheen bg-gradient-to-b from-ink-soft to-ink text-chalk shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_-10px_rgba(13,39,51,0.6)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_16px_30px_-12px_rgba(13,39,51,0.7)]",
  secondary: "glass text-ink hover:-translate-y-0.5 hover:bg-surface/80",
  light:
      "btn-sheen bg-paper text-night shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:bg-white",
  "ghost-light": "glass-dark text-paper hover:-translate-y-0.5 hover:bg-paper/15",
};

export function ButtonLink({
                             variant = "primary",
                             className,
                             ...props
                           }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return (
      <Link
          {...props}
          className={clsx(
              "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-medium transition-all duration-300",
              styles[variant],
              className,
          )}
      />
  );
}