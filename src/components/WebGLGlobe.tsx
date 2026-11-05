"use client";

import { useEffect, useRef } from "react";
import {
    AdditiveBlending,
    BackSide,
    BufferGeometry,
    Color,
    DataTexture,
    Float32BufferAttribute,
    Group,
    Line as ThreeLine,
    Mesh,
    PerspectiveCamera,
    Points,
    RepeatWrapping,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer,
    type Texture,
} from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import globe from "@/data/globe-data.json";

type Placement = "above" | "below" | "left" | "right";
type CityDef = { name: string; lat: number; lon: number; label?: Placement };

const CITIES: CityDef[] = [
    { name: "Perth", lat: -31.95, lon: 115.86, label: "left" },
    { name: "Darwin", lat: -12.46, lon: 130.84, label: "above" },
    { name: "Adelaide", lat: -34.93, lon: 138.6 },
    { name: "Melbourne", lat: -37.81, lon: 144.96, label: "below" },
    { name: "Sydney", lat: -33.87, lon: 151.21, label: "right" },
    { name: "Brisbane", lat: -27.47, lon: 153.03, label: "right" },
    { name: "Hobart", lat: -42.88, lon: 147.33 },
    { name: "Auckland", lat: -36.85, lon: 174.76, label: "right" },
    { name: "Wellington", lat: -41.29, lon: 174.78, label: "right" },
];

const ARCS: [string, string][] = [
    ["Perth", "Melbourne"],
    ["Melbourne", "Sydney"],
    ["Sydney", "Auckland"],
    ["Brisbane", "Auckland"],
    ["Perth", "Brisbane"],
    ["Darwin", "Sydney"],
    ["Auckland", "Wellington"],
];

/** Points that must be on screen at the end of the scroll story: the extremes of Australia and New Zealand. */
const KEY_POINTS: [number, number][] = [
    [-10.7, 142.5], // Cape York
    [-12.4, 130.8], // Darwin
    [-22.0, 113.6], // North West Cape
    [-34.4, 115.1], // Cape Leeuwin
    [-43.6, 146.9], // southern Tasmania
    [-28.6, 153.6], // Byron Bay
    [-34.4, 172.7], // Cape Reinga
    [-37.7, 178.5], // East Cape
    [-46.6, 168.3], // Bluff
];

const FOV = 32;
const LAT_START = -50;
const LON_START = 150;
const LAT_END = -29; // the end view is centred between Australia and New Zealand
const LON_END = 147;

const rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const smooth = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

function latLon(lat: number, lon: number, r = 1): Vector3 {
    const la = rad(lat);
    const lo = rad(lon);
    return new Vector3(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
}

/* ----------------------------- shaders ----------------------------- */

const BODY_VERT = /* glsl */ `
  varying vec3 vObj; varying vec3 vN; varying vec3 vV;
  void main() {
    vObj = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

// NASA Blue Marble by day, city lights at night, sun glint on water, atmospheric scattering at the edge.
const BODY_FRAG = /* glsl */ `
  uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uWater;
  uniform float uDark; uniform float uReady; uniform vec3 uSun;
  varying vec3 vObj; varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 N = normalize(vN); vec3 V = normalize(vV); vec3 S = normalize(uSun);
    vec3 p = normalize(vObj);
    vec2 uv = vec2(atan(p.x, p.z) / 6.2831853 + 0.5, asin(clamp(p.y, -1.0, 1.0)) / 3.14159265 + 0.5);

    // pick whichever texture derivatives are continuous, so there is no seam where the map wraps
    vec2 uvAlt = vec2(fract(uv.x + 0.5) - 0.5, uv.y);
    vec2 dx = dFdx(uv); vec2 dy = dFdy(uv);
    vec2 dxA = dFdx(uvAlt); vec2 dyA = dFdy(uvAlt);
    if (dot(dxA, dxA) + dot(dyA, dyA) < dot(dx, dx) + dot(dy, dy)) { dx = dxA; dy = dyA; }

    vec3 day = textureGrad(uDay, uv, dx, dy).rgb;
    vec3 night = textureGrad(uNight, uv, dx, dy).rgb;
    float water = textureGrad(uWater, uv, dx, dy).r;

        float ndl = dot(N, S);
    float lit = smoothstep(-0.12, 0.3, ndl);

    // Light theme: a soft, airy version of the same map. Oceans become pale aqua, land a light sage and sand,
    // keeping the texture's detail but none of its deep, heavy blues.
    float lum = dot(day, vec3(0.299, 0.587, 0.114));
    float landness = smoothstep(-0.01, 0.07, max(day.r, day.g) - day.b) * (1.0 - smoothstep(0.55, 0.95, water));
    landness = max(landness, smoothstep(0.55, 0.75, lum)); // ice and snow count as land
    vec3 oceanL = mix(vec3(0.66, 0.84, 0.90), vec3(0.88, 0.96, 0.97), smoothstep(0.03, 0.32, lum));
    vec3 landL = mix(vec3(0.74, 0.84, 0.74), vec3(0.96, 0.93, 0.84), smoothstep(0.12, 0.5, lum));
    landL = mix(landL, min(day * 1.6, vec3(1.0)), 0.22);
    vec3 dayLight = mix(oceanL, landL, landness);

    // dark theme: a real terminator. light theme: evenly lit, like a printed globe.
    float shadeDark = 0.04 + 1.12 * lit * (0.6 + 0.4 * max(ndl, 0.0));
    float shadeLight = 0.86 + 0.18 * smoothstep(-0.8, 0.9, ndl);
    vec3 col = mix(dayLight * shadeLight, day * shadeDark, uDark);
    col = mix(col, pow(col, vec3(0.92)) * vec3(0.96, 1.02, 1.05), 0.5 * uDark); // gentle cool grade at night

    // city lights on the night side
    col += night * vec3(1.0, 0.82, 0.55) * pow(1.0 - lit, 1.6) * 1.35 * uDark;

    // sun glint on the oceans
    vec3 R = reflect(-S, N);
    col += vec3(0.75, 0.85, 0.95) * pow(max(dot(R, V), 0.0), 38.0) * water * lit * mix(0.22, 0.45, uDark);

    // atmosphere at the limb
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
    vec3 sky = mix(vec3(0.86, 0.95, 1.0), vec3(0.32, 0.68, 1.0), uDark);
    col = mix(col, sky, fres * (0.18 + 0.62 * smoothstep(-0.35, 0.6, ndl)) * mix(0.75, 0.9, uDark));

    gl_FragColor = vec4(col, uReady);
  }`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vN;
  void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uK; varying vec3 vN;
  void main() {
    float n = clamp(-vN.z / 0.42, 0.0, 1.0);
    gl_FragColor = vec4(uColor, 1.0) * pow(n, 2.4) * uK;
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
    gl_PointSize = clamp(uSize * uScale / -mv.z, 10.0, 34.0);
  }`;
const CITY_FRAG = /* glsl */ `
  uniform float uTime; uniform float uReady; uniform vec3 uTintA; uniform vec3 uTintB; varying float vPhase; varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float r = fract(uTime * 0.45 + vPhase);
    float ring = smoothstep(0.1, 0.0, abs(d - r)) * (1.0 - r);
    float core = smoothstep(0.24, 0.1, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.3;
    gl_FragColor = vec4(mix(uTintA, uTintB, core), (core + ring * 0.8 + halo) * vFacing * uReady);
  }`;

const ARC_VERT = /* glsl */ `
  attribute float aT; varying float vT;
  void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ARC_FRAG = /* glsl */ `
  uniform float uTime; uniform float uPhase; uniform vec3 uColor; uniform float uOpen; uniform float uAlpha; varying float vT;
  void main() {
    float head = fract(uTime * 0.16 + uPhase);
    float d = head - vT; if (d < 0.0) d += 1.0;
    float pulse = exp(-d * 8.0);
    float edge = mix(1.0, smoothstep(0.0, 0.08, vT) * smoothstep(1.0, 0.92, vT), uOpen);
    gl_FragColor = vec4(uColor, (0.22 + pulse * 0.85) * edge * uAlpha);
  }`;

const STAR_VERT = /* glsl */ `
  uniform float uTime; uniform float uAlpha; uniform float uPx; attribute float aSeed; varying float vA;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vA = uAlpha * (0.5 + 0.5 * sin(uTime * 1.1 + aSeed * 40.0));
    gl_PointSize = uPx * (0.6 + aSeed);
  }`;
const STAR_FRAG = /* glsl */ `
  varying float vA;
  void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(0.85, 0.95, 1.0), smoothstep(0.5, 0.1, d) * vA); }`;

/* --------------------------- helpers --------------------------- */

function pathMaterial(phase: number, open: number, alpha: number) {
    return new ShaderMaterial({
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
            uTime: { value: 0 },
            uPhase: { value: phase },
            uColor: { value: new Color("#b9fff0") },
            uOpen: { value: open },
            uAlpha: { value: alpha },
        },
    });
}

function arcPoints(a: Vector3, b: Vector3, steps = 72) {
    const angle = a.angleTo(b);
    const lift = 0.03 + 0.28 * (angle / Math.PI);
    const pts: Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = a.clone().multiplyScalar(1 - t).add(b.clone().multiplyScalar(t)).normalize();
        pts.push(p.multiplyScalar(1.004 + lift * Math.sin(Math.PI * t)));
    }
    return pts;
}

function ringPoints(radius: number, tiltX: number, tiltZ: number, steps = 200) {
    const pts: Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        const v = new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
        v.applyAxisAngle(new Vector3(1, 0, 0), tiltX).applyAxisAngle(new Vector3(0, 0, 1), tiltZ);
        pts.push(v);
    }
    return pts;
}

function blankTexture(v: number) {
    const t = new DataTexture(new Uint8Array([v, v, v, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
}

/* ------------------------------ component ------------------------------ */

export function WebGLGlobe({
                               className = "",
                               onUnsupported,
                               progress,
                           }: {
    className?: string;
    onUnsupported?: () => void;
    /** 0 to 1 scroll progress of the hero story. */
    progress?: { current: number };
}) {
    const box = useRef<HTMLDivElement>(null);
    const pills = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        const el = box.current;
        if (!el) return;

        let renderer: WebGLRenderer;
        try {
            renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        } catch {
            onUnsupported?.();
            return;
        }
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dpr = window.devicePixelRatio || 1;
        renderer.setClearColor(0x000000, 0);
        const canvas = renderer.domElement;
        canvas.className = "absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing";
        canvas.style.touchAction = "pan-y"; // vertical swipes still scroll the page
        el.prepend(canvas);

        const scene = new Scene();
        const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
        camera.position.set(0, 0, 5);

        const pivot = new Group(); // positions the planet on screen
        scene.add(pivot);
        const group = new Group(); // spins the planet
        pivot.add(group);

        /* ---- planet ---- */
        const bodyMat = new ShaderMaterial({
            vertexShader: BODY_VERT,
            fragmentShader: BODY_FRAG,
            transparent: true,
            uniforms: {
                uDay: { value: blankTexture(0) as Texture },
                uNight: { value: blankTexture(0) as Texture },
                uWater: { value: blankTexture(0) as Texture },
                uDark: { value: 1 },
                uReady: { value: 0 },
                uSun: { value: new Vector3(-0.45, 0.4, 0.8) },
            },
        });
        group.add(new Mesh(new SphereGeometry(1, 128, 128), bodyMat));

        // Use the 4K map where the screen and memory can take it, otherwise 2K.
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
        const hiRes = Math.max(window.screen.width, window.screen.height) * Math.min(dpr, 2) > 1800 && memory >= 4;
        const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const loader = new TextureLoader();
        let readyAt = -1;
        const load = (url: string, uniform: "uDay" | "uNight" | "uWater", onDone?: () => void) =>
            loader.load(url, (tex) => {
                tex.wrapS = RepeatWrapping;
                tex.anisotropy = anisotropy;
                tex.needsUpdate = true;
                bodyMat.uniforms[uniform].value = tex;
                onDone?.();
                if (reduce) render(performance.now());
            });
        load(hiRes ? "/earth/earth-day-4k.jpg" : "/earth/earth-day-2k.jpg", "uDay", () => {
            readyAt = performance.now();
        });
        load("/earth/earth-night-2k.jpg", "uNight");
        load("/earth/earth-water-2k.png", "uWater");

        const atmoMat = new ShaderMaterial({
            vertexShader: ATMO_VERT,
            fragmentShader: ATMO_FRAG,
            side: BackSide,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
            uniforms: { uColor: { value: new Color("#4aa8ff") }, uK: { value: 0 } },
        });
        pivot.add(new Mesh(new SphereGeometry(1.1, 96, 96), atmoMat));

        /* ---- Australia and New Zealand: a crisp glowing coastline ---- */
        const glowMats: LineMaterial[] = [];
        const coreMats: LineMaterial[] = [];
        const lineGeos: LineGeometry[] = [];
        for (const o of globe.outlines) {
            const flat: number[] = [];
            for (let i = 0; i < o.pts.length; i += 2) {
                const p = latLon(o.pts[i + 1] / 100, o.pts[i] / 100, 1.0025);
                flat.push(p.x, p.y, p.z);
            }
            flat.push(flat[0], flat[1], flat[2]);
            const geo = new LineGeometry();
            geo.setPositions(flat);
            lineGeos.push(geo);
            const glow = new LineMaterial({ color: 0x3fe0c0, linewidth: 7, transparent: true, opacity: 0.16, depthWrite: false });
            const core = new LineMaterial({ color: 0xc9fff2, linewidth: 1.6, transparent: true, opacity: 0.95, depthWrite: false });
            glowMats.push(glow);
            coreMats.push(core);
            group.add(new Line2(geo, glow), new Line2(geo, core));
        }

        /* ---- city nodes ---- */
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
            uniforms: {
                uTime: { value: 0 },
                uReady: { value: 0 },
                uScale: { value: 500 },
                uSize: { value: 0.045 },
                uTintA: { value: new Color("#73ffe0") },
                uTintB: { value: new Color("#ffffff") },
            },
        });
        group.add(new Points(cityGeo, cityMat));

        /* ---- arcs between cities ---- */
        const byName = Object.fromEntries(CITIES.map((c, i) => [c.name, cityVec[i]]));
        const pathMats: ShaderMaterial[] = [];
        ARCS.forEach(([a, b], i) => {
            const pts = arcPoints(byName[a], byName[b]);
            const g = new BufferGeometry().setFromPoints(pts);
            g.setAttribute("aT", new Float32BufferAttribute(pts.map((_, k) => k / (pts.length - 1)), 1));
            const m = pathMaterial((i * 0.23) % 1, 1, 1);
            pathMats.push(m);
            group.add(new ThreeLine(g, m));
        });

        /* ---- orbit rings (only at the start) ---- */
        const rings = new Group();
        pivot.add(rings);
        [
            { r: 1.34, tx: 1.15, tz: 0.25, phase: 0 },
            { r: 1.6, tx: 0.9, tz: -0.45, phase: 0.5 },
        ].forEach((cfg) => {
            const pts = ringPoints(cfg.r, cfg.tx, cfg.tz);
            const g = new BufferGeometry().setFromPoints(pts);
            g.setAttribute("aT", new Float32BufferAttribute(pts.map((_, k) => k / (pts.length - 1)), 1));
            const m = pathMaterial(cfg.phase, 0, 0.5);
            pathMats.push(m);
            rings.add(new ThreeLine(g, m));
        });

        /* ---- stars (dark theme only) ---- */
        const starN = 700;
        const starPos = new Float32Array(starN * 3);
        const starSeed = new Float32Array(starN);
        for (let i = 0; i < starN; i++) {
            const v = new Vector3().randomDirection().multiplyScalar(14 + Math.random() * 6);
            starPos.set([v.x, v.y, v.z], i * 3);
            starSeed[i] = Math.random();
        }
        const starGeo = new BufferGeometry();
        starGeo.setAttribute("position", new Float32BufferAttribute(starPos, 3));
        starGeo.setAttribute("aSeed", new Float32BufferAttribute(starSeed, 1));
        const starMat = new ShaderMaterial({
            vertexShader: STAR_VERT,
            fragmentShader: STAR_FRAG,
            transparent: true,
            depthWrite: false,
            uniforms: { uTime: { value: 0 }, uAlpha: { value: 0.8 }, uPx: { value: 2 * Math.min(dpr, 2) } },
        });
        scene.add(new Points(starGeo, starMat));

        /* ---- state ---- */
        let w = 1;
        let h = 1;
        let aspect = 1;
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
        let px = 0;
        let py = 0;
        let sx = 0;
        let sy = 0;
        let lastP = -1;
        let lastNow = performance.now();
        let zStart = 5;
        let zEnd = 3;
        let cyStart = 1.04;
        let cyEnd = 0.6;
        let darkNow = document.documentElement.classList.contains("dark") ? 1 : 0;
        let darkTarget = darkNow;
        let themeDirty = true;
        let ratio = 1;
        let maxRatio = 2;
        let frameEma = 0.016;
        let slowFrames = 0;
        const tmp = new Vector3();
        const toCam = new Vector3();
        const tint = new Color();
        const tanHalf = Math.tan(rad(FOV / 2));

        const mo = new MutationObserver(() => {
            darkTarget = document.documentElement.classList.contains("dark") ? 1 : 0;
            if (reduce) {
                darkNow = darkTarget;
                themeDirty = true;
                render(performance.now());
            }
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        function applyTheme() {
            const d = darkNow;
            bodyMat.uniforms.uDark.value = d;
            atmoMat.uniforms.uColor.value.set("#8fd6e8").lerp(tint.set("#4aa8ff"), d);
            atmoMat.uniforms.uK.value = 0.42 + 0.18 * d;
            for (const m of glowMats) {
                m.color.set("#17a58e").lerp(tint.set("#3fe0c0"), d);
                m.opacity = 0.14 + 0.06 * d;
            }
            for (const m of coreMats) m.color.set("#0b6b5f").lerp(tint.set("#c9fff2"), d);
            cityMat.uniforms.uTintA.value.set("#0b8a7a").lerp(tint.set("#73ffe0"), d);
            cityMat.uniforms.uTintB.value.set("#ffffff").lerp(tint.set("#ffffff"), d);
            for (const m of pathMats) m.uniforms.uColor.value.set("#0b7a6b").lerp(tint.set("#b9fff0"), d);
            starMat.uniforms.uAlpha.value = 0.8 * d;
            themeDirty = false;
        }

        function setRatio(r: number) {
            ratio = r;
            renderer.setPixelRatio(ratio);
            renderer.setSize(w, h, false);
            cityMat.uniforms.uScale.value = (h * ratio) / (2 * tanHalf);
        }

        const pivotY = (z: number, cy: number) => (0.5 - cy) * 2 * Math.max(0.3, z) * tanHalf;

        /** Find the closest camera distance at which Australia and New Zealand still fit inside the target area. */
        function fitEnd() {
            const wide = aspect > 1.2;
            const area = wide ? { x0: 0.17, x1: 0.83, y0: 0.28, y1: 0.93 } : { x0: 0.05, x1: 0.95, y0: 0.25, y1: 0.79 };
            cyEnd = (area.y0 + area.y1) / 2;
            group.rotation.set(rad(LAT_END), -rad(LON_END), 0, "XYZ");
            const fits = (z: number) => {
                camera.position.set(0, 0, z);
                camera.lookAt(0, 0, 0);
                camera.updateMatrixWorld();
                pivot.position.y = pivotY(z - 1, cyEnd);
                pivot.updateMatrixWorld(true);
                for (const [la, lo] of KEY_POINTS) {
                    tmp.copy(latLon(la, lo, 1));
                    group.localToWorld(tmp);
                    tmp.project(camera);
                    const x = tmp.x * 0.5 + 0.5;
                    const y = -tmp.y * 0.5 + 0.5;
                    if (x < area.x0 || x > area.x1 || y < area.y0 || y > area.y1) return false;
                }
                return true;
            };
            let lo = 1.15;
            let hi = 16;
            for (let i = 0; i < 30; i++) {
                const mid = (lo + hi) / 2;
                if (fits(mid)) hi = mid;
                else lo = mid;
            }
            zEnd = hi;
        }

        function resize() {
            const r = el!.getBoundingClientRect();
            w = Math.max(1, r.width);
            h = Math.max(1, r.height);
            aspect = w / h;
            // Never below the screen's own density; only very large canvases are capped at 1.5x.
            maxRatio = Math.max(1, Math.min(dpr, w * h > 2.4e6 ? 1.5 : 2));
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
            setRatio(maxRatio);

            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const perUnit = h / 2 / tanHalf;
            const startDiameter = Math.min(Math.max(Math.min(vw * 1.05, vh * 1.05), 420), 980);
            zStart = perUnit / (startDiameter / 2);
            cyStart = aspect < 0.9 ? 1.0 : 1.04;
            fitEnd();
            for (const m of [...glowMats, ...coreMats]) m.resolution.set(w, h);
            render(performance.now());
        }

        function render(now: number) {
            const t = Math.max(0, (now - start) / 1000);
            const sec = reduce ? 3 : t;
            const dt = Math.min(0.25, Math.max(0, (now - lastNow) / 1000));
            lastNow = now;
            const f60 = dt * 60;

            // The planet fades in once its map has loaded, and the intro plays from that moment.
            const since = readyAt < 0 ? 0 : (now - readyAt) / 1000;
            const ready = readyAt < 0 ? 0 : reduce ? 1 : smooth(0, 0.6, since);
            bodyMat.uniforms.uReady.value = ready;
            atmoMat.uniforms.uK.value = (0.42 + 0.18 * darkNow) * ready;
            cityMat.uniforms.uReady.value = ready;

            // If frames are persistently slow after start-up, render fewer pixels, but never below the screen's density.
            if (!reduce && dt > 0 && since > 3) {
                frameEma += (dt - frameEma) * 0.06;
                if (frameEma > 0.03 && ratio > 1) {
                    if (++slowFrames > 45) {
                        setRatio(Math.max(1, ratio - 0.25));
                        slowFrames = 0;
                        frameEma = 0.016;
                    }
                } else slowFrames = 0;
            }

            if (Math.abs(darkTarget - darkNow) > 0.002) {
                darkNow += (darkTarget - darkNow) * (1 - Math.exp(-dt * 7));
                themeDirty = true;
            } else if (darkNow !== darkTarget) {
                darkNow = darkTarget;
                themeDirty = true;
            }
            if (themeDirty) applyTheme();

            const intro = reduce ? 1 : ease(since / 1.6);
            const dolly = reduce ? 1 : ease(since / 1.2);

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

            const k = ease(progress ? progress.current : 0);
            const sway = reduce ? 0 : Math.sin(t * 0.16) * 0.05 * (1 - k);
            const lat = LAT_START + (LAT_END - LAT_START) * k;
            const lon = LON_START + (LON_END - LON_START) * k;
            group.rotation.set(rad(lat) + userPitch, -rad(lon) + userYaw + sway - (1 - intro) * 2.0, 0, "XYZ");

            const follow = 1 - Math.exp(-dt * 4);
            sx += (px - sx) * follow;
            sy += (py - sy) * follow;
            const z = zStart + (1 - dolly) * 0.5 - k * (zStart - zEnd);
            camera.position.set(sx * 0.12 * (1 - k * 0.7), -sy * 0.08 * (1 - k * 0.7), z);
            camera.lookAt(0, 0, 0);

            // rise from the bottom at the start; at the end, sit where Australia and New Zealand fit the frame
            pivot.position.y = pivotY(z, cyStart) * (1 - k) + pivotY(z - 1, cyEnd) * k;

            cityMat.uniforms.uTime.value = sec;
            starMat.uniforms.uTime.value = sec;
            for (const m of pathMats) m.uniforms.uTime.value = sec;

            const vis = 1 - smooth(0.05, 0.32, k);
            rings.visible = vis > 0.01 && ready > 0.5;
            rings.scale.setScalar(0.9 + 0.1 * vis);

            renderer.render(scene, camera);

            // keep the HTML city labels attached to their cities
            const showPills = ready > 0.5;
            CITIES.forEach((c, i) => {
                const node = pills.current[c.name];
                if (!node) return;
                tmp.copy(cityVec[i]);
                group.localToWorld(tmp);
                toCam.copy(camera.position).sub(tmp).normalize();
                const facing = tmp.clone().sub(pivot.position).normalize().dot(toCam);
                const p = tmp.clone().project(camera);
                node.style.transform = `translate3d(${(p.x * 0.5 + 0.5) * w}px, ${(-p.y * 0.5 + 0.5) * h}px, 0)`;
                node.style.opacity = showPills && facing > 0.2 ? "1" : "0";
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
            mo.disconnect();
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
            for (const key of ["uDay", "uNight", "uWater"] as const) (bodyMat.uniforms[key].value as Texture).dispose?.();
            renderer.dispose();
            renderer.forceContextLoss();
            canvas.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={box} className={`select-none ${className || "relative"}`}>
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {CITIES.filter((c) => c.label).map((c, i) => (
                    <div
                        key={c.name}
                        ref={(node) => {
                            pills.current[c.name] = node;
                        }}
                        className="absolute left-0 top-0 transition-opacity duration-200"
                        style={{ opacity: 0 }}
                    >
            <span className={`globe-pill pill-${c.label} pill-${c.name.toLowerCase()}`} style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
              {c.name}
            </span>
                    </div>
                ))}
            </div>
            <span className="sr-only">Interactive globe showing our recruitment coverage across Australia and New Zealand.</span>
        </div>
    );
}