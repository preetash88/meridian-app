"use client";

import { useEffect, useRef } from "react";

type City = { name: string; lat: number; lon: number; label?: boolean };

// Only cities with a label get a pill. The rest are glowing nodes.
const CITIES: City[] = [
    { name: "Perth", lat: -31.95, lon: 115.86, label: true },
    { name: "Adelaide", lat: -34.93, lon: 138.6 },
    { name: "Melbourne", lat: -37.81, lon: 144.96, label: true },
    { name: "Sydney", lat: -33.87, lon: 151.21 },
    { name: "Brisbane", lat: -27.47, lon: 153.03, label: true },
    { name: "Auckland", lat: -36.85, lon: 174.76, label: true },
    { name: "Wellington", lat: -41.29, lon: 174.78 },
];
const ARCS: [string, string][] = [
    ["Perth", "Melbourne"],
    ["Melbourne", "Brisbane"],
    ["Brisbane", "Auckland"],
    ["Perth", "Brisbane"],
];

// The globe is centred on Australia and New Zealand.
const CENTER_LON = 146;
const CENTER_LAT = -30;
const POINTS = 560;
const rad = (d: number) => (d * Math.PI) / 180;

// A stylised map: positions are spread out around the centre so the city labels have room.
// It shows where we recruit, not exact geography.
const SPREAD_LAT = 1.5;
const SPREAD_LON = 1.7;

function toXYZ(lat: number, lon: number): [number, number, number] {
    const la = rad(CENTER_LAT + (lat - CENTER_LAT) * SPREAD_LAT);
    const lo = rad(CENTER_LON + (lon - CENTER_LON) * SPREAD_LON);
    return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

/** Evenly spread points on a sphere, plus each point's nearest neighbours for the mesh lines. Built once. */
function buildSphere() {
    const pts: [number, number, number][] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < POINTS; i++) {
        const y = 1 - (2 * (i + 0.5)) / POINTS;
        const r = Math.sqrt(1 - y * y);
        const phi = i * golden;
        pts.push([Math.cos(phi) * r, y, Math.sin(phi) * r]);
    }
    const pairs: [number, number][] = [];
    const seen = new Set<number>();
    for (let i = 0; i < pts.length; i++) {
        const d: [number, number][] = [];
        for (let j = 0; j < pts.length; j++) {
            if (i === j) continue;
            const dx = pts[i][0] - pts[j][0];
            const dy = pts[i][1] - pts[j][1];
            const dz = pts[i][2] - pts[j][2];
            d.push([dx * dx + dy * dy + dz * dz, j]);
        }
        d.sort((a, b) => a[0] - b[0]);
        for (let k = 0; k < 3; k++) {
            const j = d[k][1];
            const lo = Math.min(i, j);
            const hi = Math.max(i, j);
            const key = lo * POINTS + hi;
            if (!seen.has(key)) {
                seen.add(key);
                pairs.push([lo, hi]);
            }
        }
    }
    return { pts, pairs };
}

export function NetworkGlobe({ className = "" }: { className?: string }) {
    const box = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const pills = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const el = box.current;
        const cv = canvas.current;
        if (!el || !cv) return;
        const ctx = cv.getContext("2d");
        if (!ctx) return;

        const { pts, pairs } = buildSphere();
        const cities = CITIES.map((c) => ({ ...c, v: toXYZ(c.lat, c.lon) }));
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // projected coordinates, reused every frame
        const px = new Float32Array(pts.length);
        const py = new Float32Array(pts.length);
        const pz = new Float32Array(pts.length);

        let w = 0;
        let h = 0;
        let raf = 0;
        let running = false;
        let mx = 0; // smoothed pointer offset
        let my = 0;
        let tx = 0; // target pointer offset
        let ty = 0;

        function project(X: number, Y: number, Z: number, a: number, b: number): [number, number, number] {
            const x1 = X * Math.cos(a) - Z * Math.sin(a);
            const z1 = X * Math.sin(a) + Z * Math.cos(a);
            const y2 = Y * Math.cos(b) - z1 * Math.sin(b);
            const z2 = Y * Math.sin(b) + z1 * Math.cos(b);
            return [x1, y2, z2];
        }

        function draw(t: number) {
            if (!ctx) return;
            mx += (tx - mx) * 0.05;
            my += (ty - my) * 0.05;
            const yaw = rad(CENTER_LON) + rad(10) * Math.sin(t * 0.17) + rad(5) * mx;
            const tilt = rad(CENTER_LAT) + rad(3) * my;
            const R = Math.min(w, h) * 0.46;
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < pts.length; i++) {
                const [x, y, z] = project(pts[i][0], pts[i][1], pts[i][2], yaw, tilt);
                px[i] = cx + x * R;
                py[i] = cy - y * R;
                pz[i] = z;
            }

            // mesh lines, batched into three brightness levels
            const lines = [new Path2D(), new Path2D(), new Path2D()];
            for (const [a, b] of pairs) {
                const z = (pz[a] + pz[b]) / 2;
                const bucket = z > 0.4 ? 2 : z > 0 ? 1 : 0;
                lines[bucket].moveTo(px[a], py[a]);
                lines[bucket].lineTo(px[b], py[b]);
            }
            ctx.lineWidth = 0.7;
            ctx.strokeStyle = "rgba(120, 235, 210, 0.05)";
            ctx.stroke(lines[0]);
            ctx.strokeStyle = "rgba(140, 240, 220, 0.14)";
            ctx.stroke(lines[1]);
            ctx.strokeStyle = "rgba(170, 250, 235, 0.3)";
            ctx.stroke(lines[2]);

            // nodes, batched into four brightness levels
            const levels = [
                { path: new Path2D(), fill: "rgba(150, 240, 220, 0.18)", r: 0.9 },
                { path: new Path2D(), fill: "rgba(170, 245, 228, 0.4)", r: 1.1 },
                { path: new Path2D(), fill: "rgba(200, 255, 242, 0.75)", r: 1.4 },
                { path: new Path2D(), fill: "rgba(255, 255, 255, 0.95)", r: 1.7 },
            ];
            for (let i = 0; i < pts.length; i++) {
                const z = pz[i];
                const lv = z > 0.7 ? 3 : z > 0.3 ? 2 : z > -0.05 ? 1 : 0;
                const L = levels[lv];
                L.path.moveTo(px[i] + L.r, py[i]);
                L.path.arc(px[i], py[i], L.r, 0, Math.PI * 2);
            }
            for (const L of levels) {
                ctx.fillStyle = L.fill;
                ctx.fill(L.path);
            }

            // projected cities
            const proj: Record<string, { x: number; y: number; z: number }> = {};
            for (const c of cities) {
                const [x, y, z] = project(c.v[0], c.v[1], c.v[2], yaw, tilt);
                proj[c.name] = { x: cx + x * R, y: cy - y * R, z };
            }

            // arcs with a travelling highlight
            ARCS.forEach(([a, b], idx) => {
                const A = proj[a];
                const B = proj[b];
                if (!A || !B || A.z < 0.05 || B.z < 0.05) return;
                const midx = (A.x + B.x) / 2;
                const midy = (A.y + B.y) / 2;
                const dx = midx - cx;
                const dy = midy - cy;
                const n = Math.hypot(dx, dy) || 1;
                const chord = Math.hypot(B.x - A.x, B.y - A.y);
                const qx = midx + (dx / n) * chord * 0.28;
                const qy = midy + (dy / n) * chord * 0.28;

                ctx.beginPath();
                ctx.moveTo(A.x, A.y);
                ctx.quadraticCurveTo(qx, qy, B.x, B.y);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
                ctx.lineWidth = 1.1;
                ctx.stroke();

                const u = (t * 0.22 + idx * 0.27) % 1;
                const ix = (1 - u) * (1 - u) * A.x + 2 * (1 - u) * u * qx + u * u * B.x;
                const iy = (1 - u) * (1 - u) * A.y + 2 * (1 - u) * u * qy + u * u * B.y;
                const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 9);
                g.addColorStop(0, "rgba(255,255,255,0.95)");
                g.addColorStop(1, "rgba(255,255,255,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(ix, iy, 9, 0, Math.PI * 2);
                ctx.fill();
            });

            // glowing city nodes with a soft pulse
            for (const c of cities) {
                const p = proj[c.name];
                if (p.z < 0.05) continue;
                const pulse = (t * 0.6 + c.lon * 0.01) % 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 + pulse * 11, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(110, 240, 215, ${0.5 * (1 - pulse)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
                ctx.fillStyle = "#e9fff9";
                ctx.fill();
            }

            // keep the HTML pills glued to their cities
            for (const c of cities) {
                const node = pills.current[c.name];
                if (!node) continue;
                const p = proj[c.name];
                node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
                node.style.opacity = p.z > 0.12 ? "1" : "0";
            }
        }

        function resize() {
            if (!el || !cv || !ctx) return;
            const r = el.getBoundingClientRect();
            w = r.width;
            h = r.height;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            cv.width = Math.round(w * dpr);
            cv.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (!running) draw(0);
        }

        function frame(now: number) {
            if (!running) return;
            draw(now / 1000);
            raf = requestAnimationFrame(frame);
        }
        function start() {
            if (running || reduce) return;
            running = true;
            raf = requestAnimationFrame(frame);
        }
        function stop() {
            running = false;
            cancelAnimationFrame(raf);
        }

        function onPointer(e: PointerEvent) {
            if (e.pointerType !== "mouse") return;
            tx = (e.clientX / window.innerWidth - 0.5) * 2;
            ty = (e.clientY / window.innerHeight - 0.5) * 2;
        }
        function onVisibility() {
            if (document.hidden) stop();
            else if (inView) start();
        }

        let inView = true;
        const io = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView && !document.hidden) start();
            else stop();
        });
        const ro = new ResizeObserver(resize);

        resize();
        io.observe(el);
        ro.observe(el);
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        start();

        return () => {
            stop();
            io.disconnect();
            ro.disconnect();
            window.removeEventListener("pointermove", onPointer);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return (
        <div ref={box} className={`relative aspect-square ${className}`} aria-hidden="true">
            <div className="globe-core absolute inset-[4%] rounded-full" />
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            <div className="pointer-events-none absolute inset-0">
                {CITIES.filter((c) => c.label).map((c, i) => (
                    <div
                        key={c.name}
                        ref={(node) => {
                            pills.current[c.name] = node;
                        }}
                        className="absolute left-0 top-0 transition-opacity duration-300"
                        style={{ opacity: 0 }}
                    >
            <span className="globe-pill" style={{ animationDelay: `${1.3 + i * 0.18}s` }}>
              {c.name}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
}