"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
    return (
        <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-verdigris via-verdigris-bright to-verdigris"
        />
    );
}