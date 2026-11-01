// KStar Match anatomy: a four-pillar card sorter.
// node products/kstarmatch/build.mjs [--light]  →  kstarmatch.html / kstarmatch-light.html
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, kitScript, moduleScript } from "../../scripts/kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const STARS = JSON.parse(readFileSync(join(HERE, "stars.json"), "utf8")).stars;
const KOREAN = M.STEMS.map((_, stem) => STARS.filter((star) => star[0] === stem && star[3]).length);

// Kit functions the shared drawing code calls by bare name (they are globals on the page too).
const { slabOf, cylinder, solidSvg, lineSvg, dotsSvg, planOutline, insetPlan, iso, sideMatrix, pathOf, roundedPlan, lineOnTop, onTop, cameraOf } = k;

const WIDTH = 600;
const HEIGHT = 372;

// World units are about 1 px of the real bench; x runs along the bench, y toward the viewer, z up.
const C = {
  PLATE: { x: -208, y: -66, w: 388, d: 130, r: 9 },
  PLATE_H: 12,
  FOOT_H: 5,
  BENCH: { x: -196, y: -50, w: 102, d: 42, r: 3 },
  BENCH_H: 6,
  PILLAR_X: [-190, -166, -142, -118],
  PILLAR_W: 16,
  PILLAR_Y: -44,
  PILLAR_TOP: 76,
  WIN: { stem: [54, 68], branch: [34, 48] },
  CAB: { x: -36, y: -56, w: 200, d: 62, r: 3 },
  FRONT: 6,
  CASE_TOP: 44,
  TOP_Z: 47,
  DW: 19.2,
  DRAWER_Z: [7, 41],
  BOX_Z: [8, 32],
  CARD_TOP: 38,
  OPEN: 36,
  LIFT: 12,
  CARD_STEP: 2.4,
  RAIL_Y: [-44, -22],
  RAIL_TOP: 50.5,
  CARR: { x: -13, y: -48, w: 26, d: 36, r: 2.5 },
  CARR_TOP: 55,
  DIAL: [0, -30],
  DIAL_R: 12,
  DIAL_Z: 61,
  DIAL_TOP: 68,
};
const { PLATE, PLATE_H, FOOT_H, BENCH, BENCH_H, PILLAR_X, PILLAR_W, PILLAR_Y, PILLAR_TOP, WIN, CAB, FRONT, CASE_TOP, TOP_Z, DW, DRAWER_Z, BOX_Z, CARD_TOP, OPEN, LIFT, CARD_STEP, RAIL_Y, RAIL_TOP, CARR, CARR_TOP, DIAL, DIAL_R, DIAL_Z, DIAL_TOP } = C;
const PFRONT = PILLAR_Y + PILLAR_W;
const drawerX = (i) => CAB.x + 4 + i * DW;
const centreOf = (i) => drawerX(i) + (DW - 1.2) / 2;
const CENTRES = M.STEMS.map((_, i) => centreOf(i));

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [PILLAR_X[0], PILLAR_Y, PILLAR_TOP + 9], [CAB.x + CAB.w, CAB.y, DIAL_TOP + 2], [centreOf(0), FRONT + OPEN + 2, CARD_TOP + LIFT + 3]],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: 58, elevation: 34 },
);

const at = (point) => iso(point, P);
const S = (paths, style) => solidSvg(paths, style);
const L = (d, style) => lineSvg(d, style);
const D = (points, style) => dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ---- shared with the page: these functions are serialised into the live script ----

// A vertical face at y: local (x, -z) coordinates.
function planeOf(y) {
  return sideMatrix([0, y], 0, P, "left");
}
function flatRect(x0, z0, x1, z1, r, steps = 6) {
  return pathOf(roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
}
function knobPointer(cx, cy, z, turn) {
  const a = turn * Math.PI * 2;
  return lineOnTop([cx, cy], [cx + Math.sin(a) * 4.4, cy - Math.cos(a) * 4.4], z, P);
}
function needleD(score) {
  const a = (score / 100) * Math.PI * 2;
  const [x, y] = DIAL;
  return lineOnTop([x - Math.sin(a) * 3, y + Math.cos(a) * 3], [x + Math.sin(a) * (DIAL_R - 4), y - Math.cos(a) * (DIAL_R - 4)], DIAL_TOP + 0.2, P);
}
function jitterArc(low, high) {
  const [x, y] = DIAL;
  const r = DIAL_R - 6.4;
  const points = [];
  for (let s = low; s <= high + 1e-6; s += 0.5) points.push([x + Math.sin((s / 100) * Math.PI * 2) * r, y - Math.cos((s / 100) * Math.PI * 2) * r]);
  const ends = [points[0], points[points.length - 1]].map(([px, py]) => iso([px, py, DIAL_TOP + 0.1], P));
  return { d: onTop(points, DIAL_TOP + 0.1, P), ends };
}
// One drawer of the card cabinet, `open` units out, its front card lifted `lift`.
function drawerSvg(i, open, lift, korean) {
  const x0 = CAB.x + 4 + i * DW;
  const w = DW - 1.2;
  const c = x0 + w / 2;
  const y = FRONT + open;
  const out = [];
  if (open > 0.6) {
    const box = { x: x0 + 1.6, y: FRONT, w: w - 3.2, d: open, r: 0.6 };
    const runner = lineSvg(pathOf([iso([box.x + box.w, FRONT, 20], P), iso([box.x + box.w, FRONT + open - 0.6, 20], P)]), { tone: "faint" });
    out.push(solidSvg(slabOf(box, BOX_Z[0], BOX_Z[1] - BOX_Z[0], P, 2), { tone: "mid", inner: runner }));
    const well = { x: box.x + 1.2, y: FRONT, w: box.w - 2.4, d: Math.max(0.2, open - 1.2), r: 0.4 };
    out.push(`<path class="ks-well" d="${planOutline(well, BOX_Z[1], P, 2)}"/>`);
    for (let j = 9; j >= 0; j--) {
      const cy = y - 3.6 - j * CARD_STEP;
      if (cy < FRONT + 0.3) continue;
      const up = j === 0 ? lift : 0;
      const card = { x: x0 + 2.6, y: cy, w: w - 5.2, d: 0.7, r: 0.3 };
      const tab = { x: j < korean ? x0 + 3.4 : x0 + w - 8.2, y: cy, w: 4.8, d: 0.7, r: 0.3 };
      const lit = j === 0 && up > 0.5;
      let face = "";
      if (lit && up > 3) {
        const lines = [[c - 5, c + 4, CARD_TOP + up - 2], [c - 5, c + 1, CARD_TOP + up - 3.6]];
        face = lineSvg(lines.map(([a, b, z]) => pathOf([iso([a, cy + 0.7, z], P), iso([b, cy + 0.7, z], P)])).join(""), { tone: "lo", free: true });
      }
      out.push(`<g class="ks-card">${solidSvg(slabOf(card, BOX_Z[1], CARD_TOP + up - BOX_Z[1], P, 2), { tone: lit ? "hi" : "mid", lit, crease: lit ? "lo" : "faint" })}${solidSvg(slabOf(tab, CARD_TOP + up, 2.4, P, 2), { tone: lit ? "hi" : "mid", lit, crease: "none" })}${face}</g>`);
    }
  }
  const front = { x: x0, y, w, d: 2, r: 0.8 };
  out.push(solidSvg(slabOf(front, DRAWER_Z[0], DRAWER_Z[1] - DRAWER_Z[0], P, 3, 0.4), { tone: open > 0.6 ? "hi" : "mid", crease: open > 0.6 ? "lo" : "faint" }));
  const face = y + 2;
  out.push(`<g transform="${planeOf(face)}"><path class="ks-holder" d="${flatRect(c - 6, 30, c + 6, 37, 0.8, 3)}"/><path class="iso-line" data-tone="lo" d="${flatRect(c - 6, 30, c + 6, 37, 0.8, 3)}"/><path class="iso-line" data-tone="lo" data-free="" d="M${(c - 4).toFixed(1)} -34.6H${(c + 3.4).toFixed(1)}M${(c - 4).toFixed(1)} -32.4H${(c + 1).toFixed(1)}"/></g>`);
  out.push(dotsSvg([iso([c - 7.4, face, 33.5], P), iso([c + 7.4, face, 33.5], P)], { size: 0.4 }));
  out.push(solidSvg(slabOf({ x: c - 5.2, y: face, w: 1.6, d: 2, r: 0.5 }, 20.4, 2.4, P, 2), { tone: "mid", crease: "none" }));
  out.push(solidSvg(slabOf({ x: c + 3.6, y: face, w: 1.6, d: 2, r: 0.5 }, 20.4, 2.4, P, 2), { tone: "mid", crease: "none" }));
  out.push(solidSvg(slabOf({ x: c - 5.6, y: face + 1.4, w: 11.2, d: 1.6, r: 0.8 }, 20, 3.2, P, 3), { tone: "mid" }));
  return out.join("");
}

// ---- static art ----

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: PLATE.x + 22, y: PLATE.y + PLATE.d - 15, w: PLATE.w - 44, d: 7, r: 1 };
  out.push(S(slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  const label = { x: PLATE.x + 16, y: 30, w: 48, d: 12, r: 1.2 };
  out.push(S(slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(planOutline(insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(L([30, 22, 26].map((w, i) => lineOnTop([label.x + 5, label.y + 3.6 + i * 2.4], [label.x + 5 + w, label.y + 3.6 + i * 2.4], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 4, label.y + 3.2, 0.8]), at([label.x + label.w - 4, label.y + label.d - 3.2, 0.8])], { size: 0.45 }));
  return out.join("");
}

let clips = 0;
// A window let into a face at y, with its back plane `depth` behind (from examples/desk-computer).
function recess({ x0, x1, z0, z1, r, depth }, y, back = "", backClass = "ks-glass") {
  const id = `ks-clip-${clips++}`;
  const ring = roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flatRect(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${planeOf(y - depth)}"><path class="${backClass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    `</g>`,
    `<g transform="${planeOf(y)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

const PILLARS = ["year", "month", "day", "hour"];
// Only the day stem and the year branch reach the twin score; those two windows are keyed.
const KEYED = { "day-stem": true, "year-branch": true };

function pillars(reading) {
  const out = [`<path class="iso-halo" d="${k.haloOf(BENCH, 0, 4, P)}"/>`];
  out.push(S(slabOf(BENCH, 0, BENCH_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(BENCH, 3), BENCH_H, P, 4), { tone: "faint" }));
  out.push(D([[BENCH.x + 5, BENCH.y + 5], [BENCH.x + BENCH.w - 5, BENCH.y + 5], [BENCH.x + 5, BENCH.y + BENCH.d - 5], [BENCH.x + BENCH.w - 5, BENCH.y + BENCH.d - 5]].map(([x, y]) => at([x, y, BENCH_H])), { size: 0.45 }));
  out.push(k.faceTextSvg(k.topMatrix([BENCH.x + BENCH.w / 2, BENCH.y + BENCH.d - 9], BENCH_H, P, "x"), "四柱", { size: 5, tone: "lo", anchor: "middle" }));
  PILLARS.forEach((name, i) => {
    const plan = { x: PILLAR_X[i], y: PILLAR_Y, w: PILLAR_W, d: PILLAR_W, r: 1.6 };
    const tone = name === "day" ? "hi" : name === "hour" ? "lo" : "mid";
    const cx = plan.x + PILLAR_W / 2;
    const cy = plan.y + PILLAR_W / 2;
    out.push(S(slabOf(insetPlan(plan, -1.6), BENCH_H, 3, P, 4, 0.5), { tone: "mid" }));
    out.push(S(slabOf(plan, BENCH_H + 3, PILLAR_TOP - BENCH_H - 3, P, 4, 0.6), { tone, crease: tone === "hi" ? "lo" : "faint", inner: L(k.sideSeam(plan, 24, P, 4), { tone: "faint" }) }));
    for (const part of ["stem", "branch"]) {
      const [z0, z1] = WIN[part];
      const key = `${name}-${part}`;
      const pair = name === "hour" ? null : reading.pillars[name];
      const glyph = pair ? (part === "stem" ? M.STEMS[pair[0]].hanja : M.BRANCHES[pair[1]]) : "";
      const text = `<text class="ks-glyph" data-glyph="${key}"${KEYED[key] ? " data-key" : ""} x="${cx}" y="${-(z0 + 3.4)}" font-size="9.4" text-anchor="middle">${glyph}</text>`;
      out.push(recess({ x0: plan.x + 2.2, x1: plan.x + PILLAR_W - 2.2, z0, z1, r: 1.4, depth: 1.4 }, PFRONT, text, KEYED[key] ? "ks-glass ks-keyed" : "ks-glass"));
    }
    out.push(D([at([cx, PFRONT, 26.5])], { size: 0.45, tone: tone === "hi" ? "hi" : "mid" }));
    out.push(S(slabOf(insetPlan(plan, -1), PILLAR_TOP, 4, P, 4, 0.5), { tone: "mid" }));
    out.push(S(cylinder(cx, cy, 5, PILLAR_TOP + 4, 4.5, P, 32), { tone: "mid" }));
    out.push(L(k.knurl(cx, cy, 5, PILLAR_TOP + 4, PILLAR_TOP + 8.5, 30, P), { tone: "lo" }));
    const turn = pair0(reading, name);
    out.push(`<path class="iso-line" data-tone="${name === "day" ? "lit" : "hi"}" data-knob="${name}" data-free="end" d="${knobPointer(cx, cy, PILLAR_TOP + 8.5, turn)}"/>`);
    out.push(D([at([cx, cy, PILLAR_TOP + 8.5])], { size: 0.5, tone: "hi" }));
  });
  return out.join("");
}
const pair0 = (reading, name) => (name === "hour" ? 0 : reading.pillars[name][0] / 10);

function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, 8, P)}"/>`];
  out.push(S(slabOf(insetPlan(CAB, 2), 0, 4, P, 4), { tone: "lo" }));
  out.push(S(slabOf(CAB, 4, CASE_TOP - 4, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(CAB, 4.8, P, 4), { tone: "faint" }) }));
  const top = { x: CAB.x - 4, y: CAB.y - 1.5, w: CAB.w + 8, d: CAB.d + 3, r: 3 };
  out.push(S(slabOf(top, CASE_TOP, TOP_Z - CASE_TOP, P, 4, 1.2), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(top, 2.4), TOP_Z, P, 4), { tone: "faint" }));
  // index strip: one stop per drawer, a major tick at each drawer centre
  const strip = { x: CAB.x + 4, y: FRONT - 9, w: CAB.w - 8, d: 6, r: 1 };
  out.push(S(slabOf(strip, TOP_Z, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const major = CENTRES.map((x) => lineOnTop([x, strip.y], [x, strip.y + 3.4], TOP_Z + 0.6, P)).join("");
  const minor = CENTRES.slice(0, -1).map((x) => lineOnTop([x + DW / 2, strip.y], [x + DW / 2, strip.y + 1.8], TOP_Z + 0.6, P)).join("");
  out.push(L(minor, { tone: "lo" }), L(major, { tone: "mid" }));
  out.push(D([at([strip.x + 2.4, strip.y + 4.4, TOP_Z + 0.6]), at([strip.x + strip.w - 2.4, strip.y + 4.4, TOP_Z + 0.6])], { size: 0.4 }));
  for (const y of RAIL_Y) {
    out.push(S(slabOf({ x: CAB.x - 0.4, y, w: CAB.w + 0.8, d: 5, r: 1 }, TOP_Z, RAIL_TOP - TOP_Z, P, 3, 0.4), { tone: "mid" }));
    out.push(D([CAB.x + 4, CAB.x + CAB.w - 4].map((x) => at([x, y + 2.5, RAIL_TOP])), { size: 0.4 }));
  }
  for (const x of [CAB.x - 3.8, CAB.x + CAB.w + 0.4]) {
    out.push(S(slabOf({ x, y: RAIL_Y[0] - 2, w: 3.4, d: RAIL_Y[1] - RAIL_Y[0] + 9, r: 1 }, TOP_Z, 7, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 1.7, RAIL_Y[0] + 2.5, TOP_Z + 7]), at([x + 1.7, RAIL_Y[1] + 2.5, TOP_Z + 7])], { size: 0.45 }));
  }
  return out.join("");
}

function carriage(reading) {
  const out = [];
  out.push(S(slabOf(CARR, RAIL_TOP, CARR_TOP - RAIL_TOP, P, 4, 0.6), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(CARR, 2.2), CARR_TOP, P, 4), { tone: "faint" }));
  out.push(D(k.corners(CARR, 4.2).map(([cx, cy]) => at([cx, cy, CARR_TOP])), { size: 0.45 }));
  for (const x of [-12, 5]) for (const y of [RAIL_Y[0] - 1.5, RAIL_Y[1] - 1.5]) {
    out.push(S(slabOf({ x, y, w: 7, d: 8, r: 1.2 }, CARR_TOP, 1.6, P, 3, 0.4), { tone: "mid" }));
    out.push(D([at([x + 1.8, y + 4, CARR_TOP + 1.6]), at([x + 5.2, y + 4, CARR_TOP + 1.6])], { size: 0.4 }));
  }
  out.push(S(slabOf({ x: -1.8, y: CARR.y + CARR.d, w: 3.6, d: 10, r: 1 }, 51.5, 1.5, P, 3), { tone: "mid" }));
  out.push(L(lineOnTop([0, CARR.y + CARR.d + 1.5], [0, CARR.y + CARR.d + 10], 53, P), { tone: "hi" }));
  const [x, y] = DIAL;
  out.push(S(cylinder(x, y, 4.6, CARR_TOP, 2, P, 24), { tone: "lo" }));
  out.push(S(cylinder(x, y, 3, CARR_TOP + 2, DIAL_Z - CARR_TOP - 2, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(cylinder(x, y, DIAL_R, DIAL_Z, DIAL_TOP - DIAL_Z, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, DIAL_R, DIAL_TOP - 3, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, DIAL_R - 2.2, DIAL_TOP, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, DIAL_R - 2.2, 50, 5, DIAL_TOP, [1.1, 2.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  const marks = M.GRADES.filter((grade) => grade.min > 0).map(({ min }) => {
    const a = (min / 100) * Math.PI * 2;
    return lineOnTop([x + Math.sin(a) * (DIAL_R - 2.2), y - Math.cos(a) * (DIAL_R - 2.2)], [x + Math.sin(a) * (DIAL_R - 5.6), y - Math.cos(a) * (DIAL_R - 5.6)], DIAL_TOP, P);
  });
  out.push(L(marks.join(""), { tone: "hi" }));
  out.push(S(slabOf({ x: x + DIAL_R - 1, y: y - 2.2, w: 4.4, d: 4.4, r: 1.1 }, DIAL_Z + 1.6, 4, P, 3), { tone: "mid" }));
  out.push(S(slabOf({ x: x + DIAL_R + 3, y: y - 3, w: 2.4, d: 6, r: 1.1 }, DIAL_Z + 0.8, 5.6, P, 3), { tone: "mid" }));
  const arc = jitterArc(reading.low, reading.high);
  out.push(`<g data-part="jitter">${L(arc.d, { tone: "mid" })}${D(arc.ends, { size: 0.55, tone: "mid" })}</g>`);
  out.push(`<path data-part="needle" class="iso-line" data-tone="lit" data-free="start" d="${needleD(0)}" style="stroke-width:1.1"/>`);
  out.push(L(k.ring(x, y, 1.4, DIAL_TOP, P, 16), { tone: "mid" }));
  return out.join("");
}

// ---- the page ----

const T0 = Date.UTC(1995, 11, 20); // hover range: 30 days across New Year 1996
const TOUR = [7, 17]; // the idle tour: 1995-12-27 → 1996-01-06, ten day stems in a row
const startDay = TOUR[0];
const startDate = new Date(T0 + startDay * 86400000);
const first = M.readingOf(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, startDate.getUTCDate(), STARS);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A card sorter on a bench plate. On the left, four pillar columns for year, month, day and hour each show two characters in windows: the eight characters of a birthday. On the right, a card cabinet has ten drawers, one per heavenly stem, with ten star cards in each. A carriage with a dial gauge rides rails on the cabinet to the drawer of the day stem; that drawer slides out, its front card lifts, and the gauge reads the twin score.",
  body: [
    plate(),
    pillars(first),
    cabinet(),
    `<g data-part="carriage" transform="${k.translateAlong(P, [CENTRES[first.stem], 0, 0])}">${carriage(first)}</g>`,
    ...M.STEMS.map((_, i) => `<g data-drawer="${i}">${drawerSvg(i, 0, 0, KOREAN[i])}</g>`),
  ],
});

const fn = (f) => f.toString();
const live = `
${moduleScript(new URL("./model.mjs", import.meta.url))}
const P = ${JSON.stringify(P)};
const { ${Object.keys(C).join(", ")} } = ${JSON.stringify(C)};
const STARS = ${JSON.stringify(STARS)};
const KOREAN = ${JSON.stringify(KOREAN)};
const CENTRES = ${JSON.stringify(CENTRES)};
const T0 = ${T0}, SPAN = 29, TOUR = ${JSON.stringify(TOUR)};
const PILLARS = ${JSON.stringify(PILLARS)};
const PILLAR_CENTRES = ${JSON.stringify(PILLAR_X.map((x) => [x + PILLAR_W / 2, PILLAR_Y + PILLAR_W / 2]))};
${fn(planeOf)}
${fn(flatRect)}
${fn(knobPointer)}
${fn(needleD)}
${fn(jitterArc)}
${fn(drawerSvg)}
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const carriageEl = svg.querySelector('[data-part="carriage"]');
const needle = svg.querySelector('[data-part="needle"]');
const jitter = svg.querySelector('[data-part="jitter"]');
const drawers = KOREAN.map((_, i) => svg.querySelector('[data-drawer="' + i + '"]'));
const glyphs = {};
svg.querySelectorAll("[data-glyph]").forEach((el) => { glyphs[el.dataset.glyph] = el; });
const knobs = {};
svg.querySelectorAll("[data-knob]").forEach((el) => { knobs[el.dataset.knob] = el; });
const readout = document.querySelector("[data-readout]");
const status = document.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const follow = (x, target, dt, tau, calm) => (calm ? target : x + (target - x) * (1 - Math.exp(-dt / tau)));
const two = (n) => String(n).padStart(2, "0");

let day = TOUR[0], reading = null, score = 0, dateText = "";
let x = CENTRES[0], needleAt = 0, lift = { at: 0, rate: 0 };
const open = KOREAN.map(() => 0);
const drawn = KOREAN.map(() => "0|0");
let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0;

function setDay(next, yearShift = 0) {
  const date = new Date(T0 + next * 86400000);
  const year = date.getUTCFullYear() + yearShift, month = date.getUTCMonth() + 1, d = date.getUTCDate();
  day = next;
  reading = readingOf(year, month, d, STARS);
  score = rollTwin(reading);
  dateText = year + "." + two(month) + "." + two(d);
  PILLARS.forEach((name, i) => {
    if (name === "hour") return;
    const [stem, branch] = reading.pillars[name];
    glyphs[name + "-stem"].textContent = STEMS[stem].hanja;
    glyphs[name + "-branch"].textContent = BRANCHES[branch];
    const [cx, cy] = PILLAR_CENTRES[i];
    knobs[name].setAttribute("d", knobPointer(cx, cy, PILLAR_TOP + 8.5, stem / 10));
  });
  const arc = jitterArc(reading.low, reading.high);
  jitter.innerHTML = '<path class="iso-line" data-tone="mid" d="' + arc.d + '"/>' + arc.ends.map(([cx, cy]) => '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="0.55" class="ks-dot"/>').join("");
  const p = reading.pillars;
  const eight = [p.year, p.month, p.day].map(([s, b]) => STEMS[s].hanja + BRANCHES[b]).join(" ");
  stage.setAttribute("aria-valuenow", String(day));
  stage.setAttribute("aria-valuetext", dateText + ", " + eight + ", 일간 " + STEMS[reading.stem].hanja + ", " + STEMS[reading.stem].hanja + " 서랍, 트윈 점수 " + score);
  run();
}

function draw() {
  carriageEl.setAttribute("transform", translateAlong(P, [x, 0, 0]));
  needle.setAttribute("d", needleD(needleAt));
  open.forEach((o, i) => {
    const up = i === reading.stem ? lift.at : 0;
    const key = o.toFixed(2) + "|" + up.toFixed(2);
    if (key === drawn[i]) return;
    drawn[i] = key;
    drawers[i].innerHTML = drawerSvg(i, o, up, KOREAN[i]);
  });
  const here = open[reading.stem] > OPEN - 2 && Math.abs(needleAt - score) < 0.6;
  const text = dateText + " · " + STEMS[reading.stem].hanja + " 서랍 · " + (here ? score + "점 " + gradeOf(score).ko : "찾는 중");
  if (readout.textContent !== text) readout.textContent = text;
  if (here && status.dataset.said !== dateText + score) { status.dataset.said = dateText + score; status.textContent = dateText + ": " + STEMS[reading.stem].hanja + " 서랍, " + score + "점 " + gradeOf(score).ko + "."; }
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) {
    clock += dt;
    const want = TOUR[0] + (Math.floor(clock / 3.4) % (TOUR[1] - TOUR[0] + 1));
    if (want !== day) setDay(want);
  }
  const target = CENTRES[reading.stem];
  x = follow(x, target, dt, 0.24, calm);
  if (Math.abs(target - x) < 0.02) x = target;
  const arrived = Math.abs(target - x) < 1.5;
  open.forEach((o, i) => {
    const want = i === reading.stem && arrived ? OPEN : 0;
    let next = follow(o, want, dt, i === reading.stem ? 0.15 : 0.12, calm);
    if (Math.abs(want - next) < 0.02) next = want;
    open[i] = next;
  });
  const out = open[reading.stem] > OPEN - 3;
  const wantLift = out ? LIFT : 0;
  if (calm) { lift.at = wantLift; lift.rate = 0; }
  else for (let s = 0; s < 4; s++) { lift.rate += ((wantLift - lift.at) * 260 - lift.rate * 22) * dt / 4; lift.at += lift.rate * dt / 4; }
  if (Math.abs(wantLift - lift.at) < 0.005 && Math.abs(lift.rate) < 0.005) { lift.at = wantLift; lift.rate = 0; }
  needleAt = follow(needleAt, out && lift.at > LIFT * 0.4 ? score : 0, dt, 0.22, calm);
  if (Math.abs(needleAt - (out ? score : 0)) < 0.02) needleAt = out ? score : 0;
  draw();
  const settled = !touring && x === target && open.every((o, i) => o === (i === reading.stem ? OPEN : 0)) && lift.rate === 0 && lift.at === LIFT && needleAt === score;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
function steer(next, yearShift = 0) {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 3600);
  setDay(Math.max(0, Math.min(SPAN, next)), yearShift);
}
let yearShift = 0;
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.1) / 0.8));
  const next = Math.round(share * SPAN);
  if (next !== day || touring) steer(next, yearShift);
});
stage.addEventListener("keydown", (event) => {
  let next = day, shift = yearShift;
  if (event.key === "ArrowRight") next += event.shiftKey ? 10 : 1;
  else if (event.key === "ArrowLeft") next -= event.shiftKey ? 10 : 1;
  else if (event.key === "ArrowUp") shift += 1;
  else if (event.key === "ArrowDown") shift -= 1;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = SPAN;
  else return;
  event.preventDefault();
  yearShift = shift;
  steer(next, yearShift);
});
if (still.matches) touring = false;
setDay(TOUR[0]);
x = CENTRES[reading.stem];
draw();
`;

const css = `<style>
.ks-glass{fill:var(--anatomy-shade-0)}
.ks-glass.ks-keyed{fill:var(--anatomy-lit-shade)}
.ks-glyph{fill:var(--anatomy-mid);font-family:"Noto Serif KR","Noto Serif CJK KR","Source Han Serif K","AppleMyungjo","Batang","Songti SC","Noto Serif CJK SC","WenQuanYi Zen Hei",serif}
.ks-glyph[data-key]{fill:var(--anatomy-lit)}
.ks-well{fill:var(--anatomy-shade-0);stroke:var(--anatomy-faint);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.ks-holder{fill:var(--anatomy-top)}
.ks-dot{fill:var(--anatomy-mid)}
.ks-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage{touch-action:pan-y}
.iso-stage:focus{outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:520px){.iso-plate{overflow:hidden}.iso-stage svg{width:110%;margin:0 -5% -2%}}
</style>`;

const firstScore = M.clampScore(Math.max(...first.bases));
const body =
  css +
  k.plateHtml({
    fig: "Fig 1",
    title: "KStar Match",
    hint: "생일 바꾸기: 마우스 · ← → 하루 · ↑ ↓ 한 해",
    readout: `${startDate.getUTCFullYear()}.${String(startDate.getUTCMonth() + 1).padStart(2, "0")}.${String(startDate.getUTCDate()).padStart(2, "0")} · ${M.STEMS[first.stem].hanja} 서랍 · ${firstScore}점`,
    keys: [
      { mark: "lit", label: "일간(日干)과 연지(年支): 여덟 글자 중 트윈 점수에 쓰이는 두 글자" },
      { mark: "raised", label: "천간 서랍 10개 × 스타 카드 10장, 앞 카드가 트윈" },
      { mark: "edge", label: "다이얼 눈금 40·55·70·85: 등급 경계, 바늘 옆 호: 랜덤 +0~9" },
    ],
    caption:
      "KStar Match의 해부도. 생년월일이 연·월·일·시 네 기둥에 여덟 글자를 세우고, 그중 일간(日干)이 캐리지를 열 개의 천간 서랍 중 하나로 보냅니다. 서랍마다 스타 카드 10장(모두 100장), 한국 스타 카드가 앞에 꽂혀 있고(왼쪽 탭), 맨 앞 카드가 트윈입니다. 점수는 같은 일간 40 + 같은 음양 10 + 띠 일치 15(삼합 8) + 인기도 4~5에 매번 랜덤 0~9를 더하고 25~98로 자릅니다. 연주·월주는 양력 1월 1일과 양력 달로 바뀌고(입춘·절기가 아님), 일주는 1900-01-31을 甲子일로 셉니다(실제로는 甲辰일). 시주는 입력해도 매칭에 쓰이지 않습니다.",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="KStar Match 카드 선별기. 좌우 화살표로 생일 하루씩, 위아래로 한 해씩 바꿉니다." aria-valuemin="0" aria-valuemax="29" aria-valuenow="${startDay}">${svg}<span class="ks-sr" role="status" aria-live="polite" data-status></span></div>`,
  });

const name = theme === "light" ? "kstarmatch-light.html" : "kstarmatch.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "KStar Match anatomy", theme, body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="ko">'));
console.log("wrote", name);
