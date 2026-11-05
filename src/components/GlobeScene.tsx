"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { NetworkGlobe } from "./NetworkGlobe";

// three.js is large, so it loads after the page text has already rendered.
const WebGLGlobe = dynamic(() => import("./WebGLGlobe").then((m) => m.WebGLGlobe), {
    ssr: false,
    loading: () => <div className="aspect-square" aria-hidden="true" />,
});

/** The 3D globe where WebGL works, and the lighter 2D version everywhere else. */
export function GlobeScene({ className = "", progress }: { className?: string; progress?: { current: number } }) {
    const [webgl, setWebgl] = useState(true);
    return webgl ? <WebGLGlobe className={className} progress={progress} onUnsupported={() => setWebgl(false)} /> : <NetworkGlobe className={className} />;
}