"use client";

import { useEffect, useRef } from "react";
import {
    AdditiveBlending,
    BackSide,
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Group,
    LineSegments,
    LineBasicMaterial,
    Line as ThreeLine,
    Mesh,
    PerspectiveCamera,
    Points,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    Vector3,
    WebGLRenderer,
} from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import globe from "@/data/globe-data.json";

type Placement = "above" | "below" | "left" | "right";
type CityDef = { name: string; lat: number; lon: number; label?: Placement };

const CITIES: CityDef[] = [
    { name: "Perth", lat: -31.95, lon: 115.86, label: "left" },
    { name: "Darwin", lat: -12.46, lon: 130.84 },
    { name: "Adelaide", lat: -34.93, lon: 138.6 },
    { name: "Melbourne", lat: -37.81, lon: 144.96, label: "below" },
    { name: "Sydney", lat: -33.87, lon: 151.21, label: "right" },
    { name: "Brisbane", lat: -27.47, lon: 153.03, label: "above" },
    { name: "Hobart", lat: -42.88, lon: 147.33 },
    { name: "Auckland", lat: -36.85, lon: 174.76, label: "right" },
    { name: "Wellington", lat: -41.29, lon: 174.78 },
];

const ARCS: [string, string][] = [
    ["Perth", "Melbourne"],
    ["Melbourne", "Sydney"],
    ["Sydney", "Auckland"],
    ["Brisbane", "Auckland"],
    ["Perth", "Brisbane"],
    ["Darwin", "Sydney"],
];

// Scroll story: the view starts tilted south so Australia sits on the upper part of the globe,
// then the camera pushes in and centres on Australia and New Zealand.
const FOV = 32;
const LAT_START = -50;
const LAT_END = -21;
const LON_START = 150;
const LON_END_WIDE = 139;
const LON_END_NARROW = 141;

const rad = (d: number) => (d * Math.PI) / 180;
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function latLon(lat: number, lon: number, r = 1): Vector3 {
    const la = rad(lat);
    const lo = rad(lon);
    return new Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
}

/* ----------------------------- shaders ----------------------------- */

const BODY_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const BODY_FRAG = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.4);
    vec3 base = mix(vec3(0.012, 0.055, 0.075), vec3(0.03, 0.15, 0.17), clamp(vN.y * 0.5 + 0.55, 0.0, 1.0));
    float lit = pow(max(dot(vN, normalize(vec3(-0.5, 0.6, 0.7))), 0.0), 2.0) * 0.12;
    vec3 col = base + vec3(0.1, 0.6, 0.55) * f * 0.85 + vec3(0.15, 0.7, 0.65) * lit;
    gl_FragColor = vec4(col, 1.0);
  }`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ATMO_FRAG = /* glsl */ `
  varying vec3 vN;
  void main() {
    // back faces: -vN.z is 0 at the outer limb and grows toward the globe, so the glow fades outward
    float n = clamp(-vN.z / 0.42, 0.0, 1.0);
    float i = pow(n, 2.6);
    gl_FragColor = vec4(0.14, 0.78, 0.68, 1.0) * i * 0.5;
  }`;

const DOT_VERT = /* glsl */ `
  uniform float uTime; uniform float uScale; uniform float uSize; uniform float uAlpha; uniform float uTwinkle;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normalize(mat3(modelViewMatrix) * position);
    float facing = dot(n, normalize(-mv.xyz));
    float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime * 1.3 + aSeed * 6.2831));
    vAlpha = uAlpha * smoothstep(-0.04, 0.3, facing) * tw;
    gl_PointSize = min(uSize * uScale / -mv.z, 14.0);
  }`;
const DOT_FRAG = /* glsl */ `
  uniform vec3 uColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.18, d);
    gl_FragColor = vec4(uColor, a * vAlpha);
  }`;

const CITY_VERT = /* glsl */ `
  uniform float uScale; uniform float uSize;
  attribute float aPhase; varying float vPhase; varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vec3 n = normalize(mat3(modelViewMatrix) * position);
    vFacing = smoothstep(0.02, 0.25, dot(n, normalize(-mv.xyz)));
    vPhase = aPhase;
    gl_PointSize = min(uSize * uScale / -mv.z, 64.0);
  }`;
const CITY_FRAG = /* glsl */ `
  uniform float uTime; varying float vPhase; varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float r = fract(uTime * 0.45 + vPhase);
    float ring = smoothstep(0.1, 0.0, abs(d - r)) * (1.0 - r);
    float core = smoothstep(0.2, 0.05, d);
    float halo = smoothstep(0.45, 0.0, d) * 0.35;
    float a = (core + ring * 0.9 + halo) * vFacing;
    gl_FragColor = vec4(mix(vec3(0.45, 1.0, 0.88), vec3(1.0), core), a);
  }`;

const ARC_VERT = /* glsl */ `
  attribute float aT; varying float vT;
  void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ARC_FRAG = /* glsl */ `
  uniform float uTime; uniform float uPhase; varying float vT;
  void main() {
    float head = fract(uTime * 0.16 + uPhase);
    float d = head - vT; if (d < 0.0) d += 1.0;
    float pulse = exp(-d * 8.0);
    float edge = smoothstep(0.0, 0.08, vT) * smoothstep(1.0, 0.92, vT);
    gl_FragColor = vec4(vec3(0.7, 1.0, 0.93), (0.2 + pulse * 0.85) * edge);
  }`;

/* --------------------------- geometry helpers --------------------------- */

function dotsFromFlat(flat: number[], r = 1.002) {
    const n = flat.length / 2;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const v = new Vector3();
    for (let i = 0; i < n; i++) {
        const lat = flat[i * 2] / 100;
        const lon = flat[i * 2 + 1] / 100;
        v.copy(latLon(lat, lon, r));
        pos.set([v.x, v.y, v.z], i * 3);
        seed[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new Float32BufferAttribute(seed, 1));
    return g;
}

function dotMaterial(color: string, size: number, alpha: number, twinkle: number, additive: boolean) {
    return new ShaderMaterial({
        vertexShader: DOT_VERT,
        fragmentShader: DOT_FRAG,
        transparent: true,
        depthWrite: false,
        blending: additive ? AdditiveBlending : undefined,
        uniforms: {
            uTime: { value: 0 },
            uScale: { value: 500 },
            uSize: { value: size },
            uAlpha: { value: alpha },
            uTwinkle: { value: twinkle },
            uColor: { value: new Color(color) },
        },
    });
}

function graticule() {
    const pts: number[] = [];
    const seg = 72;
    for (let lat = -75; lat <= 75; lat += 15) {
        for (let i = 0; i < seg; i++) {
            const a = latLon(lat, (i / seg) * 360 - 180, 1.0005);
            const b = latLon(lat, ((i + 1) / seg) * 360 - 180, 1.0005);
            pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
    }
    for (let lon = -180; lon < 180; lon += 15) {
        for (let i = 0; i < seg / 2; i++) {
            const a = latLon(-88 + (i / (seg / 2)) * 176, lon, 1.0005);
            const b = latLon(-88 + ((i + 1) / (seg / 2)) * 176, lon, 1.0005);
            pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return new LineSegments(
        g,
        new LineBasicMaterial({ color: 0x5fe0c8, transparent: true, opacity: 0.07, depthWrite: false }),
    );
}

/** A curved path between two points, lifted above the surface. */
function arcPoints(a: Vector3, b: Vector3, steps = 72) {
    const angle = a.angleTo(b);
    const lift = 0.04 + 0.3 * (angle / Math.PI);
    const pts: Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = a.clone().multiplyScalar(1 - t).add(b.clone().multiplyScalar(t)).normalize();
        pts.push(p.multiplyScalar(1.004 + lift * Math.sin(Math.PI * t)));
    }
    return pts;
}

/* ------------------------------ component ------------------------------ */

export function WebGLGlobe({
                               className = "",
                               onUnsupported,
                               progress,
                           }: {
    className?: string;
    onUnsupported?: () => void;
    /** 0 to 1 scroll progress of the hero story. Optional. */
    progress?: { current: number };
}) {
    const box = useRef<HTMLDivElement>(null);
    const pills = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const el = box.current;
        if (!el) return;

        let renderer: WebGLRenderer;
        try {
            renderer = new WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: true, powerPreference: "high-performance" });
        } catch {
            onUnsupported?.();
            return;
        }
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setClearColor(0x000000, 0);
        const canvas = renderer.domElement;
        canvas.className = "absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing";
        canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page
        el.prepend(canvas);

        const scene = new Scene();
        const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
        camera.position.set(0, 0, 5);

        const group = new Group();
        scene.add(group);

        // Globe body and atmosphere
        group.add(new Mesh(new SphereGeometry(0.995, 72, 72), new ShaderMaterial({ vertexShader: BODY_VERT, fragmentShader: BODY_FRAG })));
        const atmosphere = new Mesh(
            new SphereGeometry(1.1, 64, 64),
            new ShaderMaterial({ vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG, side: BackSide, transparent: true, blending: AdditiveBlending, depthWrite: false }),
        );
        scene.add(atmosphere);
        group.add(graticule());

        // Dots: dim world context, bright Australia and New Zealand
        const world = new Points(dotsFromFlat(globe.world), dotMaterial("#3fa597", 0.0105, 0.5, 0, false));
        const au = new Points(dotsFromFlat(globe.au), dotMaterial("#8ff5dd", 0.0092, 1, 0.35, true));
        const nz = new Points(dotsFromFlat(globe.nz), dotMaterial("#8ff5dd", 0.0092, 1, 0.35, true));
        group.add(world, au, nz);
        const dotMats = [world.material, au.material, nz.material] as ShaderMaterial[];

        // Coastlines
        const lineMats: LineMaterial[] = [];
        const lineGeos: LineGeometry[] = [];
        for (const o of globe.outlines) {
            const flat: number[] = [];
            for (let i = 0; i < o.pts.length; i += 2) {
                const p = latLon(o.pts[i + 1] / 100, o.pts[i] / 100, 1.003);
                flat.push(p.x, p.y, p.z);
            }
            flat.push(flat[0], flat[1], flat[2]);
            const geo = new LineGeometry();
            geo.setPositions(flat);
            const mat = new LineMaterial({ color: 0xd9fff6, linewidth: 1.3, transparent: true, opacity: 0.85 });
            lineMats.push(mat);
            lineGeos.push(geo);
            group.add(new Line2(geo, mat));
        }

        // City nodes
        const cityPos = new Float32Array(CITIES.length * 3);
        const cityPhase = new Float32Array(CITIES.length);
        const cityVec = CITIES.map((c, i) => {
            const v = latLon(c.lat, c.lon, 1.006);
            cityPos.set([v.x, v.y, v.z], i * 3);
            cityPhase[i] = (i * 0.37) % 1;
            return v;
        });
        const cityGeo = new BufferGeometry();
        cityGeo.setAttribute("position", new Float32BufferAttribute(cityPos, 3));
        cityGeo.setAttribute("aPhase", new Float32BufferAttribute(cityPhase, 1));
        const cityMat = new ShaderMaterial({
            vertexShader: CITY_VERT,
            fragmentShader: CITY_FRAG,
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
            uniforms: { uTime: { value: 0 }, uScale: { value: 500 }, uSize: { value: 0.05 } },
        });
        group.add(new Points(cityGeo, cityMat));

        // Arcs and their travelling lights
        const byName = Object.fromEntries(CITIES.map((c, i) => [c.name, cityVec[i]]));
        const arcData = ARCS.map(([a, b], i) => {
            const pts = arcPoints(byName[a], byName[b]);
            const g = new BufferGeometry().setFromPoints(pts);
            g.setAttribute("aT", new Float32BufferAttribute(pts.map((_, k) => k / (pts.length - 1)), 1));
            const m = new ShaderMaterial({
                vertexShader: ARC_VERT,
                fragmentShader: ARC_FRAG,
                transparent: true,
                depthWrite: false,
                blending: AdditiveBlending,
                uniforms: { uTime: { value: 0 }, uPhase: { value: (i * 0.23) % 1 } },
            });
            group.add(new ThreeLine(g, m));
            return { pts, mat: m, phase: (i * 0.23) % 1 };
        });
        const sparkPos = new Float32Array(ARCS.length * 3);
        const sparkSeed = new Float32Array(ARCS.length);
        const sparkGeo = new BufferGeometry();
        sparkGeo.setAttribute("position", new Float32BufferAttribute(sparkPos, 3));
        sparkGeo.setAttribute("aSeed", new Float32BufferAttribute(sparkSeed, 1));
        const sparkMat = dotMaterial("#ffffff", 0.03, 1, 0, true);
        group.add(new Points(sparkGeo, sparkMat));
        dotMats.push(sparkMat);

        /* ---- state ---- */
        let w = 1;
        let h = 1;
        let raf = 0;
        let running = false;
        let inView = true;
        const start = performance.now();
        let userYaw = 0;
        let userPitch = 0;
        let velYaw = 0;
        let velPitch = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let lastInteract = -10;
        let px = 0; // pointer parallax target and smoothed value
        let py = 0;
        let sx = 0;
        let sy = 0;
        let scrollP = 0;
        let lastP = -1;
        let lastNow = performance.now();
        let zStart = 5;
        let zEnd = 3;
        let lonEnd = LON_END_WIDE;
        const tmp = new Vector3();
        const toCam = new Vector3();

        function resize() {
            const r = el!.getBoundingClientRect();
            w = Math.max(1, r.width);
            h = Math.max(1, r.height);
            const ratio = Math.min(window.devicePixelRatio || 1, w * h > 1.2e6 ? 1.5 : 2);
            renderer.setPixelRatio(ratio);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();

            // Start: a planet whose diameter fits the screen. End: close enough that the surface fills the frame.
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const perUnit = h / 2 / Math.tan(rad(FOV / 2)); // pixels per world unit at distance 1
            const startDiameter = Math.min(Math.max(Math.min(vw * 1.05, vh), 420), 980);
            // close enough that the globe nearly fills the frame, but with its curve still visible
            const endRadius = Math.min(Math.hypot(vw, vh) * 0.5 * 0.82, vw * 0.95);
            lonEnd = vw < 700 ? LON_END_NARROW : LON_END_WIDE;
            zStart = perUnit / (startDiameter / 2);
            zEnd = perUnit / endRadius;

            const scale = (h * ratio) / (2 * Math.tan(rad(FOV / 2)));
            for (const m of dotMats) m.uniforms.uScale.value = scale;
            cityMat.uniforms.uScale.value = scale;
            for (const m of lineMats) m.resolution.set(w, h);
            render(performance.now());
        }

        function render(now: number) {
            const t = (now - start) / 1000;
            const sec = reduce ? 3 : t;

            // intro: the globe spins into place while the camera dollies in
            const intro = reduce ? 1 : ease(t / 3.4);
            const dolly = reduce ? 1 : ease(t / 2.6);

            // Everything below is scaled by real elapsed time, so it behaves the same at any frame rate.
            const dt = Math.min(0.25, Math.max(0, (now - lastNow) / 1000));
            lastNow = now;
            const f60 = dt * 60;

            // idle sway, drag inertia and easing back to the focus point
            const idle = !dragging && now / 1000 - lastInteract > 2.2;
            if (!dragging) {
                userYaw += velYaw * f60;
                userPitch += velPitch * f60;
                velYaw *= Math.pow(0.94, f60);
                velPitch *= Math.pow(0.94, f60);
            }
            if (idle) {
                userYaw = ((userYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
                const back = 1 - Math.exp(-dt * 2.4);
                userYaw -= userYaw * back;
                userPitch -= userPitch * back;
            }
            userPitch = Math.max(-0.9, Math.min(0.9, userPitch));

            scrollP = progress ? progress.current : 0;
            const k = ease(scrollP);
            const sway = reduce ? 0 : Math.sin(t * 0.16) * 0.08;
            const lon = LON_START + (lonEnd - LON_START) * k;
            const lat = LAT_START + (LAT_END - LAT_START) * k;
            group.rotation.set(rad(lat) + userPitch, -rad(lon) + userYaw + sway - (1 - intro) * 2.3, 0, "XYZ");

            const follow = 1 - Math.exp(-dt * 3);
            sx += (px - sx) * follow;
            sy += (py - sy) * follow;
            const z = zStart + (1 - dolly) * 0.6 - k * (zStart - zEnd);
            camera.position.set(sx * 0.16, -sy * 0.1, z);
            camera.lookAt(0, 0, 0);

            for (const m of dotMats) m.uniforms.uTime.value = sec;
            cityMat.uniforms.uTime.value = sec;
            for (const a of arcData) a.mat.uniforms.uTime.value = sec;

            // travelling lights along the arcs
            const sp = sparkGeo.attributes.position;
            arcData.forEach((a, i) => {
                const head = (sec * 0.16 + a.phase) % 1;
                const p = a.pts[Math.min(a.pts.length - 1, Math.floor(head * (a.pts.length - 1)))];
                sp.setXYZ(i, p.x, p.y, p.z);
            });
            sp.needsUpdate = true;

            renderer.render(scene, camera);

            // keep the HTML city labels attached to their cities
            CITIES.forEach((c, i) => {
                const node = pills.current[c.name];
                if (!node) return;
                tmp.copy(cityVec[i]);
                group.localToWorld(tmp);
                toCam.copy(camera.position).sub(tmp).normalize();
                const facing = tmp.clone().normalize().dot(toCam);
                const p = tmp.clone().project(camera);
                node.style.transform = `translate3d(${(p.x * 0.5 + 0.5) * w}px, ${(-p.y * 0.5 + 0.5) * h}px, 0)`;
                node.style.opacity = facing > 0.2 ? "1" : "0";
            });
        }

        function frame(now: number) {
            if (!running) return;
            render(now);
            raf = requestAnimationFrame(frame);
        }
        function play() {
            if (running || reduce) return;
            running = true;
            raf = requestAnimationFrame(frame);
        }
        function pause() {
            running = false;
            cancelAnimationFrame(raf);
        }

        /* ---- interaction ---- */
        function onDown(e: PointerEvent) {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            velYaw = 0;
            velPitch = 0;
            canvas.setPointerCapture(e.pointerId);
        }
        function onMove(e: PointerEvent) {
            if (e.pointerType === "mouse") {
                px = (e.clientX / window.innerWidth - 0.5) * 2;
                py = (e.clientY / window.innerHeight - 0.5) * 2;
            }
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            velYaw = dx * 0.0035;
            velPitch = dy * 0.0025;
            userYaw += dx * 0.0055;
            userPitch += dy * 0.004;
            lastInteract = performance.now() / 1000;
            if (reduce) render(performance.now());
        }
        function onUp(e: PointerEvent) {
            dragging = false;
            lastInteract = performance.now() / 1000;
            if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
            if (reduce) render(performance.now());
        }
        function onScroll() {
            // when motion is reduced there is no animation loop, so redraw when the story moves
            if (reduce && progress && progress.current !== lastP) {
                lastP = progress.current;
                render(performance.now());
            }
        }
        function onVisibility() {
            if (document.hidden) pause();
            else if (inView) play();
        }

        canvas.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove, { passive: true });
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);

        const io = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView && !document.hidden) play();
            else pause();
        });
        const ro = new ResizeObserver(resize);
        io.observe(el);
        ro.observe(el);
        resize();
        onScroll();
        play();

        return () => {
            pause();
            io.disconnect();
            ro.disconnect();
            canvas.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            window.removeEventListener("scroll", onScroll);
            document.removeEventListener("visibilitychange", onVisibility);
            scene.traverse((obj) => {
                const o = obj as Mesh;
                o.geometry?.dispose?.();
                const mat = o.material as ShaderMaterial | ShaderMaterial[] | undefined;
                if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
                else mat?.dispose?.();
            });
            lineGeos.forEach((g) => g.dispose());
            renderer.dispose();
            renderer.forceContextLoss();
            canvas.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={box} className={`relative aspect-square select-none ${className}`}>
            <div className="globe-core pointer-events-none absolute inset-[2%] rounded-full" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {CITIES.filter((c) => c.label).map((c, i) => (
                    <div
                        key={c.name}
                        ref={(node) => {
                            pills.current[c.name] = node;
                        }}
                        className="absolute left-0 top-0 transition-opacity duration-300"
                        style={{ opacity: 0 }}
                    >
            <span className={`globe-pill pill-${c.label}`} style={{ animationDelay: `${1.6 + i * 0.16}s` }}>
              {c.name}
            </span>
                    </div>
                ))}
            </div>
            <span className="sr-only">Interactive globe showing our recruitment coverage across Australia and New Zealand.</span>
        </div>
    );
}