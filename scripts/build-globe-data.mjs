/**
 * Builds src/data/globe-data.json from Natural Earth (public domain) via the world-atlas package.
 *
 *   npm i -D world-atlas topojson-client d3-geo
 *   node scripts/build-globe-data.mjs
 *
 * Output (all coordinates are integers: degrees x 100, to keep the file small):
 *   world    flat [lat, lon, lat, lon, ...]  dim dots for the rest of the world
 *   au, nz   flat [lat, lon, ...]            bright dots filling Australia and New Zealand
 *   outlines [ { id, pts: [lon, lat, lon, lat, ...] } ]  coastlines (mainland, Tasmania, NZ islands...)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import { mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const countries = JSON.parse(readFileSync(require.resolve("world-atlas/countries-50m.json"), "utf8"));
const land = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));

const all = feature(countries, countries.objects.countries).features;
const AU = all.find((f) => f.id === "036");
const NZ = all.find((f) => f.id === "554");
const landFeature = feature(land, land.objects.land);

const q = (n) => Math.round(n * 100);

/** Points on a roughly even grid (rows staggered, columns widened toward the poles) that fall inside a shape. */
function sample(shape, step, bbox, exclude = []) {
    const [lonMin, latMin, lonMax, latMax] = bbox;
    const out = [];
    let row = 0;
    for (let lat = latMin; lat <= latMax; lat += step) {
        const stepLon = step / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
        const offset = row % 2 ? stepLon / 2 : 0;
        for (let lon = lonMin + offset; lon <= lonMax; lon += stepLon) {
            const p = [lon, lat];
            if (exclude.some((e) => geoContains(e, p))) continue;
            if (geoContains(shape, p)) out.push(q(lat), q(lon));
        }
        row++;
    }
    return out;
}

/** Outer rings only, drop tiny or far-off islands, thin out near-duplicate points. */
function rings(feat, id, keep) {
    const polys = feat.geometry.type === "Polygon" ? [feat.geometry.coordinates] : feat.geometry.coordinates;
    const result = [];
    for (const poly of polys) {
        const ring = poly[0];
        const lons = ring.map((p) => p[0]);
        const lats = ring.map((p) => p[1]);
        const cLon = lons.reduce((a, b) => a + b, 0) / lons.length;
        const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const area = (Math.max(...lons) - Math.min(...lons)) * (Math.max(...lats) - Math.min(...lats));
        if (!keep(cLon, cLat) || area < 0.2) continue;
        const pts = [];
        let last = null;
        for (const [lon, lat] of ring) {
            if (!last || Math.hypot(lon - last[0], lat - last[1]) > 0.05) {
                pts.push(q(lon), q(lat));
                last = [lon, lat];
            }
        }
        result.push({ id, pts });
    }
    return result;
}

const auDots = sample(AU, 0.55, [112, -44, 154.5, -10]);
const nzDots = sample(NZ, 0.4, [166, -47.5, 178.7, -34]);
const worldDots = sample(landFeature, 1.5, [-180, -78, 180, 84], [AU, NZ]);

const outlines = [
    ...rings(AU, "au", (lon, lat) => lon > 110 && lon < 156 && lat < -9 && lat > -45),
    ...rings(NZ, "nz", (lon) => lon > 160 && lon < 180),
];



const data = { world: worldDots, au: auDots, nz: nzDots, outlines };
mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/data/globe-data.json", import.meta.url), JSON.stringify(data));

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(
    `world ${worldDots.length / 2} dots, AU ${auDots.length / 2}, NZ ${nzDots.length / 2}, ` +
    `${outlines.length} outlines (${outlines.map((o) => o.id + ":" + o.pts.length / 2).join(", ")}) -> ${kb(JSON.stringify(data).length)}`,
);