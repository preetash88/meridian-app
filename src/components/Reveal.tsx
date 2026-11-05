"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Fade and rise once, as the element scrolls into view. Transform and opacity only. */
export function Reveal({
                           children,
                           delay = 0,
                           y = 14,
                           className,
                           as = "div",
                       }: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
    as?: "div" | "li" | "article" | "section";
}) {
    const Tag = motion[as];
    return (
        <Tag
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay, ease: [0.2, 0.8, 0.2, 1] }}
            className={className}
        >
            {children}
        </Tag>
    );
}