"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { NetworkGlobe } from "./NetworkGlobe";

// three.js is large, so it loads after the page text has already rendered.
const WebGLGlobe = dynamic(() => import("./WebGLGlobe").then((m) => m.WebGLGlobe), { ssr: false });

/** The 3D globe where WebGL works, and the lighter 2D version everywhere else. Fills its parent. */
export function GlobeScene({ progress }: { progress?: { current: number } }) {
    const [webgl, setWebgl] = useState(true);
    if (webgl) return <WebGLGlobe className="absolute inset-0" progress={progress} onUnsupported={() => setWebgl(false)} />;
    return (
        <div className="absolute inset-0 flex items-end justify-center overflow-hidden [filter:invert(1)_hue-rotate(180deg)] dark:[filter:none]">
            <NetworkGlobe className="w-[min(110vw,60rem)] translate-y-[46%]" />
        </div>
    );
}