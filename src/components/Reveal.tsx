"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Fade and rise once, as the element scrolls into view. Transform and opacity only. */
export function Reveal({
                           children,
                           delay = 0,
                           y = 22,
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
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </Tag>
    );
}