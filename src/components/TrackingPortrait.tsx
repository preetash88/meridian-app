"use client";

import { useEffect, useRef, useState } from "react";
import { MeridianArcs } from "./MeridianArcs";

const pad = (i: number) => String(i).padStart(3, "0");
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Frame = ImageBitmap | HTMLImageElement;

/**
 * A portrait whose head follows the cursor, drawn from a short frame sequence on a canvas.
 *
 *  - Frames 0..turnEnd are the head turn: frame 0 looks right, frame `turnEnd` faces the headline.
 *    The cursor's position scrubs through them.
 *  - Frames after `turnEnd` are an extra gesture (a blink, or a thumbs-up). It plays when the visitor stops
 *    moving. With `hoverTrigger` it also plays whenever the cursor is over the portrait, and with `hold` it
 *    keeps looping between two frames (so the blink repeats) until the cursor leaves.
 *
 * Every frame is decoded once, up front, into an ImageBitmap, so drawing a frame never has to decode anything
 * in the middle of a sweep. Nothing runs while the pointer is still or the portrait is off screen.
 */
export function TrackingPortrait({
                                     dir,
                                     count,
                                     turnEnd,
                                     rest = 0.85,
                                     size = 640,
                                     idleDelay = 5000,
                                     hoverTrigger = false,
                                     hold,
                                     reach = 1,
                                     label,
                                 }: {
    /** folder of frames named 000.webp, 001.webp, ... */
    dir: string;
    /** number of frames */
    count: number;
    /** index of the last frame of the head turn */
    turnEnd: number;
    /** where she looks before the visitor moves the mouse: 0 = right, 1 = towards the headline */
    rest?: number;
    /** pixel size of the (square) frames */
    size?: number;
    /** milliseconds without mouse movement before the extra gesture plays */
    idleDelay?: number;
    /** also play the extra gesture while the cursor is over the portrait */
    hoverTrigger?: boolean;
    /** [from, to] frame range to keep looping while the gesture is held (e.g. a thumbs-up with blinks) */
    hold?: [number, number];
    /** how far the cursor has to travel to turn her head fully; larger = gentler */
    reach?: number;
    label: string;
}) {
    const root = useRef<HTMLDivElement>(null);
    const tilt = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const restFrame = Math.round(rest * turnEnd);

    useEffect(() => {
        const el = root.current;
        const tl = tilt.current;
        const cv = canvas.current;
        const ctx = cv?.getContext("2d");
        if (!el || !tl || !cv || !ctx) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // the still image stays

        const hoverless = window.matchMedia("(hover: none)").matches;
        const FPS = 24;
        const blinkLen = count - 1 - turnEnd; // frames in the extra gesture
        const holdLo = hold ? Math.max(0, hold[0] - turnEnd) : 0;
        const holdHi = hold ? Math.min(blinkLen, hold[1] - turnEnd) : blinkLen;

        // ---- frames: decoded once, up front ----
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
        const cap = hoverless || memory <= 4 ? 480 : size; // lighter on phones and small devices
        const px = Math.max(256, Math.min(cap, Math.round(el.clientWidth * dpr) || size));
        cv.width = px;
        cv.height = px;

        const store: (Frame | undefined)[] = new Array(count);
        const loaded: boolean[] = new Array(count).fill(false);
        let loadedCount = 0;
        let drawn = -1;
        let cancelled = false;
        let raf = 0;
        let inView = true;

        const mark = (i: number, f: Frame) => {
            store[i] = f;
            if (!loaded[i]) {
                loaded[i] = true;
                loadedCount++;
            }
        };
        const load = async (i: number) => {
            const url = `${dir}/${pad(i)}.webp`;
            if (typeof createImageBitmap === "function") {
                for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
                    try {
                        const res = await fetch(attempt ? `${url}?retry=${attempt}` : url);
                        if (!res.ok) throw new Error(String(res.status));
                        const blob = await res.blob();
                        let bmp: ImageBitmap;
                        try {
                            bmp = await createImageBitmap(blob, { resizeWidth: px, resizeHeight: px, resizeQuality: "high" });
                        } catch {
                            bmp = await createImageBitmap(blob); // browsers without the resize options
                        }
                        if (cancelled) {
                            bmp.close();
                            return;
                        }
                        mark(i, bmp);
                        return;
                    } catch {
                        await sleep(300 * (attempt + 1));
                    }
                }
            }
            // fallback: a plain image (older browsers, or the bitmap route failed)
            await new Promise<void>((resolve) => {
                const im = new Image();
                im.decoding = "async";
                im.onload = () => {
                    mark(i, im);
                    resolve();
                };
                im.onerror = () => resolve();
                im.src = url;
            });
        };
        const nearestLoaded = (i: number) => {
            for (let d = 0; d < count; d++) {
                if (i - d >= 0 && loaded[i - d]) return i - d;
                if (i + d < count && loaded[i + d]) return i + d;
            }
            return -1;
        };
        const draw = (pos: number) => {
            const i = Math.min(count - 1, Math.max(0, Math.round(pos)));
            if (i === drawn) return;
            const j = nearestLoaded(i);
            if (j < 0) return;
            ctx.drawImage(store[j] as Frame, 0, 0, px, px);
            drawn = i;
        };

        // ---- motion ----
        let target = rest; // 0 = looking right, 1 = looking towards the headline
        let s = rest;
        let frame = restFrame;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let last = 0;
        let nextIdle = performance.now() + idleDelay;
        let idlePending = false;
        // the extra gesture: plays forward from the end of the turn, then back (or loops while pinned)
        let idleActive = false;
        let idlePos = 0;
        let idleDir = 1;
        let idleFast = false;
        let inLoop = false; // looping between holdLo and holdHi
        let loopDir = -1;
        let holdUntil = 0;
        let pinnedHover = false; // cursor is over the portrait
        let pinnedTimer = false; // mouse has been still / tap pulse
        let tapTimer = 0;

        const tick = (now: number) => {
            raf = 0;
            const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
            last = now;

            // on touch screens she looks around by herself
            if (hoverless && !idleActive && !idlePending) target = 0.58 + 0.4 * Math.sin((now / 1000) * ((2 * Math.PI) / 7));

            if (idleActive) {
                const pinned = pinnedHover || pinnedTimer;
                if (inLoop && hold && pinned) {
                    // hold the gesture: pause, play to the other end, pause, and so on. Each pass includes a blink.
                    if (now >= holdUntil) {
                        idlePos += loopDir * dt * FPS;
                        if (loopDir > 0 && idlePos >= holdHi) {
                            idlePos = holdHi;
                            loopDir = -1;
                            holdUntil = now + 900 + Math.random() * 900;
                        } else if (loopDir < 0 && idlePos <= holdLo) {
                            idlePos = holdLo;
                            loopDir = 1;
                            holdUntil = now + 700 + Math.random() * 700;
                        }
                    }
                } else {
                    inLoop = false;
                    idlePos += idleDir * dt * FPS * (idleFast ? 2 : 1);
                    if (idleDir > 0 && idlePos >= holdHi) {
                        idlePos = holdHi;
                        if (hold && pinned) {
                            inLoop = true;
                            loopDir = -1;
                            holdUntil = now + 1100;
                        } else idleDir = -1;
                    } else if (idleDir < 0 && idlePos <= 0) {
                        idlePos = 0;
                        idleActive = false;
                        // after a full play, wait a while before the next one; if the visitor interrupted it, use the normal delay
                        nextIdle = now + (idleFast ? idleDelay : 7000);
                        idleFast = false;
                    }
                }
                frame = turnEnd + idlePos;
            } else {
                const k = 1 - Math.exp(-dt * 8);
                s += (target - s) * k;
                frame = Math.min(1, Math.max(0, s)) * turnEnd;
                // wait until every frame is ready, so the gesture never plays with gaps
                if (idlePending && s > 0.985 && loadedCount === count) {
                    idlePending = false;
                    idleActive = true;
                    idlePos = 0;
                    idleDir = 1;
                    idleFast = false;
                    inLoop = false;
                }
            }
            draw(frame);

            const kt = 1 - Math.exp(-dt * 9);
            cx += (tx - cx) * kt;
            cy += (ty - cy) * kt;
            tl.style.transform = `perspective(1100px) translate3d(${(cx * 8).toFixed(2)}px, ${(cy * 5).toFixed(2)}px, 0) rotateY(${(cx * 6).toFixed(2)}deg) rotateX(${(-cy * 4).toFixed(2)}deg)`;

            const busy =
                (hoverless && !document.hidden) ||
                idleActive ||
                idlePending ||
                Math.abs(target - s) > 0.001 ||
                Math.abs(tx - cx) > 0.0015 ||
                Math.abs(ty - cy) > 0.0015;
            if (busy && inView) raf = requestAnimationFrame(tick);
            else last = 0;
        };
        const kick = () => {
            if (!raf && inView) raf = requestAnimationFrame(tick);
        };

        // the resting frame first (so something shows straight away), then the head turn, then the extra gesture
        (async () => {
            await load(restFrame);
            if (cancelled) return;
            draw(restFrame);
            setReady(true);
            const order: number[] = [];
            for (let i = 0; i < count; i++) if (i !== restFrame) order.push(i);
            let next = 0;
            const worker = async () => {
                while (!cancelled && next < order.length) {
                    await load(order[next++]);
                    if (!cancelled) kick();
                }
            };
            const start = () => {
                for (let w = 0; w < 4; w++) void worker();
            };
            const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
            if (ric) ric(start);
            else setTimeout(start, 200);
        })();

        // ---- pointer ----
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            nextIdle = performance.now() + idleDelay;
            const r = el.getBoundingClientRect();
            const faceX = r.left + r.width * 0.5;
            const faceY = r.top + r.height * 0.5;
            const inside = hoverTrigger && Math.hypot(e.clientX - faceX, e.clientY - faceY) < r.width * 0.54;
            tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
            ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2));
            if (inside) {
                // cursor on the portrait: face the visitor and play the gesture; small movements don't interrupt it
                pinnedTimer = false;
                target = 1;
                if (!pinnedHover) {
                    pinnedHover = true;
                    if (idleActive) {
                        if (idleDir < 0 && !inLoop) {
                            idleDir = 1;
                            idleFast = false;
                        }
                    } else idlePending = true;
                }
            } else {
                pinnedHover = false;
                pinnedTimer = false;
                idlePending = false;
                if (idleActive) {
                    inLoop = false;
                    idleDir = -1;
                    idleFast = true;
                }
                const reachPx = Math.max(280, window.innerWidth * 0.32) * reach;
                target = Math.min(1, Math.max(0, 0.5 + (faceX - e.clientX) / (2 * reachPx)));
            }
            kick();
        };

        // a still mouse (or, on touch screens, a tap) plays the gesture too
        const pulse = (ms: number) => {
            if (!inView || document.hidden || idleActive || idlePending) return;
            target = 1;
            idlePending = true;
            pinnedTimer = !!hold;
            window.clearTimeout(tapTimer);
            if (ms > 0)
                tapTimer = window.setTimeout(() => {
                    pinnedTimer = false;
                    idlePending = false;
                    if (idleActive) {
                        inLoop = false;
                        idleDir = -1;
                        idleFast = true;
                    }
                }, ms);
            kick();
        };
        const idleCheck = window.setInterval(() => {
            if (hoverless || !inView || document.hidden || idleActive || idlePending) return;
            if (performance.now() < nextIdle || loadedCount < count) return;
            pulse(0);
        }, 400);
        const onTap = (e: PointerEvent) => {
            if (e.pointerType === "mouse" || !hold) return;
            pulse(3800);
        };
        const touchCycle = hoverless && hold ? window.setInterval(() => pulse(3800), 9000) : 0;

        const io = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) kick();
        });
        io.observe(el);
        const onVisibility = () => {
            if (!document.hidden) kick();
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerdown", onTap, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        kick();

        return () => {
            cancelled = true;
            window.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerdown", onTap);
            document.removeEventListener("visibilitychange", onVisibility);
            window.clearInterval(idleCheck);
            if (touchCycle) window.clearInterval(touchCycle);
            window.clearTimeout(tapTimer);
            io.disconnect();
            cancelAnimationFrame(raf);
            for (const f of store) if (typeof ImageBitmap !== "undefined" && f instanceof ImageBitmap) f.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dir, count, turnEnd, rest, size, idleDelay, hoverTrigger, hold?.[0], hold?.[1], reach, restFrame]);

    return (
        <div ref={root} className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[23rem] lg:max-w-[27rem]">
            {/* the Meridian globe around the portrait */}
            <MeridianArcs className="absolute left-1/2 top-1/2 -z-10 w-[134%] -translate-x-1/2 -translate-y-1/2" />
            <div
                aria-hidden="true"
                className="absolute -inset-[12%] -z-10 rounded-full"
                style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--c-verdigris) 24%, transparent), transparent)" }}
            />

            <div ref={tilt} className="absolute inset-0 will-change-transform">
                <div className="pose-idle absolute inset-0">
                    <div
                        className="relative h-full w-full overflow-hidden rounded-full bg-[#1f2c4f] shadow-[0_34px_70px_-34px_rgba(4,18,26,0.75)] ring-1 ring-verdigris/40"
                        style={{ clipPath: "circle(50%)" }}
                    >
                        {/* the resting frame, shown immediately; the canvas takes over once it can animate */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${dir}/${pad(restFrame)}.webp`} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
                        <canvas
                            ref={canvas}
                            width={size}
                            height={size}
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full"
                            style={{ opacity: ready ? 1 : 0 }}
                        />
                    </div>
                </div>
            </div>
            <span className="sr-only">{label}</span>
        </div>
    );
}