// 수정체(crystalline lens): 모양체 고리에 매달린 수정체 모형과 같은 순간의 경선 단면판.
// node figures/lens/build.mjs [--light]  →  lens.html / lens-light.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, kitScript, latheScript, moduleScript } from "../../scripts/kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const { slabOf, cylinder, solidSvg, lineSvg, dotsSvg, planOutline, insetPlan, iso, depthOf, sideMatrix, pathOf } = k;
const { sceneOf, profileOf, radiusAt, slopeAt, LAYERS } = M;

const WIDTH = 600;
const HEIGHT = 430;

// 1 mm = 8 world units. 모형의 광축은 world x, 전면(앞쪽)이 +x.
const C = {
  U: 8,
  PLATE: { x: -172, y: -70, w: 382, d: 140, r: 9 },
  PLATE_H: 12,
  FOOT_H: 5,
  STAND: { x: -126, y: -36, w: 62, d: 62, r: 3 },
  MODEL: [-95, -5, 84],
  TURN: -20,
  SU: 11,
  SECTION: [104, 112],
  PANEL: { x: 30, y: 26, w: 150, d: 4, r: 1 },
  PANEL_Z: [12, 210],
  HOLDER: { x: 22, y: 18, w: 166, d: 20, r: 2 },
  HOLDER_H: 10,
};
const { U, SU, TURN, PLATE, PLATE_H, FOOT_H, STAND, MODEL, SECTION, PANEL, PANEL_Z, HOLDER, HOLDER_H } = C;
const PANEL_FRONT = PANEL.y + PANEL.d;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(PANEL, PANEL_Z[0], PANEL_Z[1]), [MODEL[0], MODEL[1], MODEL[2] + 62], [MODEL[0], MODEL[1] - 62, MODEL[2]], [MODEL[0], MODEL[1] + 62, MODEL[2]]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 48, elevation: 30 },
);

const at = (point) => iso(point, P);
const S = (paths, style) => solidSvg(paths, style);
const L = (d, style) => lineSvg(d, style);
const D = (points, style) => dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P));

// ---- shared with the page ----

// The model: post, ciliary ring, zonules, lens, painted far to near.
function modelSvg(sc) {
  const { lens, eq, ring, zonules } = sc;
  const [mx, my, mz] = MODEL;
  const t = (TURN * Math.PI) / 180;
  const ahead = [Math.cos(t), Math.sin(t), 0];
  const F = G.frameOf([mx + ahead[0] * eq.s * U, my + ahead[1] * eq.s * U, mz], [-ahead[0], -ahead[1], 0], [-ahead[1], ahead[0], 0], [0, 0, 1]);
  const V = G.viewOf(P);
  const centre = depthOf([mx, my, mz], P);
  const ri = ring.inner * U;
  const ro = ring.outer * U;
  const s0 = (eq.s + 0.15) * U;
  const s1 = (eq.s + 1.75) * U;
  const out = [];
  // post under the ring, ending on the ring's outer surface
  out.push(solidSvg(cylinder(mx, my, 6.5, 6, 2.4, P, 28), { tone: "lo" }));
  out.push(solidSvg(cylinder(mx, my, 4.2, 8.4, mz - ro - 8.4 + 0.4, P, 24), { tone: "mid", crease: "none" }));
  // the ring as 72 blocks, about one per ciliary process, each painted at its own depth
  const blocks = [];
  for (let i = 0; i < 72; i++) {
    const a0 = (i / 72) * Math.PI * 2;
    const a1 = ((i + 1) / 72) * Math.PI * 2;
    const poly = [[ri * Math.cos(a0), ri * Math.sin(a0)], [ro * Math.cos(a0), ro * Math.sin(a0)], [ro * Math.cos(a1), ro * Math.sin(a1)], [ri * Math.cos(a1), ri * Math.sin(a1)]];
    const mid = G.pointOf(F, (s0 + s1) / 2, (ri + ro) / 2, (a0 + a1) / 2);
    blocks.push({ key: G.dot3(mid, V), svg: solidSvg(G.prismOf(F, poly, s0, s1, P), { tone: "mid", crease: "none" }) });
  }
  blocks.sort((a, b) => a.key - b.key);
  const ringPart = (near) => `<g class="ln-ring">${blocks.filter((b) => (b.key > centre) === near).map((b) => b.svg).join("")}</g>`;
  out.push(ringPart(false));
  // zonules: 18 meridians × 3 fibres, each a slack-aware curve
  const fibres = [];
  for (let m = 0; m < 18; m++) {
    const angle = ((m + 0.5) / 18) * Math.PI * 2;
    for (const z of zonules) {
      const a = G.pointOf(F, z.from[0] * U, z.from[1] * U, angle);
      const b = G.pointOf(F, z.to[0] * U, z.to[1] * U, angle);
      const radial = G.pointOf(F, 0, 1, angle);
      const inward = G.sub3(G.pointOf(F, 0, 0, angle), radial);
      const mid = G.add3(G.mul3(G.add3(a, b), 0.5), G.mul3(inward, -2 * z.sag * U));
      const [pa, pc, pb] = [a, mid, b].map((p) => iso(p, P));
      fibres.push({ near: G.dot3(G.mul3(G.add3(a, b), 0.5), V) > centre, d: `M${pa[0].toFixed(1)} ${pa[1].toFixed(1)}Q${pc[0].toFixed(1)} ${pc[1].toFixed(1)} ${pb[0].toFixed(1)} ${pb[1].toFixed(1)}` });
    }
  }
  const fibreSvg = (near) => `<path class="ln-zonule" d="${fibres.filter((f) => f.near === near).map((f) => f.d).join("")}"/>`;
  out.push(fibreSvg(false));
  // the lens
  const meridian = profileOf(lens, 48).map(([s, r], i, all) => (i === 0 || i === all.length - 1 ? [s * U, 0] : [s * U, r * U, 1]));
  const lensPaths = G.lathe(meridian, F, P, { steps: 72, smooth: { slope: (s) => slopeAt(lens, s / U), radius: (s) => radiusAt(lens, s / U) * U, rows: 4 } });
  const equator = lineSvg(G.arcOf(F, eq.s * U, eq.r * U, P), { tone: "faint" });
  out.push(solidSvg(lensPaths, { tone: "hi", lit: true, crease: "none", inner: equator }));
  out.push(fibreSvg(true));
  out.push(ringPart(true));
  return out.join("");
}

// The section panel, in the panel's own face coordinates (x along world x, y = −z).
function sectionSvg(sc) {
  const { lens, eq, ring, zonules, effort } = sc;
  const [sx, sz] = SECTION;
  const X = (s) => sx + (eq.s - s) * SU;
  const Y = (r, half) => -(sz + half * r * SU);
  const pt = ([s, r], half) => `${X(s).toFixed(2)} ${Y(r, half).toFixed(2)}`;
  const shape = (points) => {
    const top = points.map((p) => pt(p, 1));
    const bottom = [...points].reverse().map((p) => pt(p, -1));
    return `M${top.join("L")}L${bottom.join("L")}Z`;
  };
  const profile = profileOf(lens, 64);
  const centre = lens.T * 0.56; // 앞 피질이 뒤 피질보다 두꺼움(연간 12 vs 8 µm) → 핵은 약간 뒤쪽 [도식]
  const scaled = (a, b) => profile.map(([s, r]) => [centre + (s - centre) * a, r * b]);
  const out = [];
  // ciliary body, top and bottom: a muscle triangle with its apex toward the lens
  const shift = 0.15 * effort;
  const apex = [eq.s - 0.5 - shift, ring.inner];
  const inner = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const s = apex[0] + t * (eq.s + 1.9 - apex[0]);
    const r = ring.inner + 0.18 * t + 0.16 * Math.abs(Math.sin(Math.PI * 4 * t)) * -1 + 0.16;
    inner.push([s, r]);
  }
  const body = [[eq.s - 1.1 - shift, ring.inner + 0.3], apex, ...inner, [eq.s + 3.4, ring.outer - 0.55], [eq.s + 3.4, ring.outer], [eq.s - 1.4, ring.outer]];
  for (const half of [1, -1]) {
    const d = `M${body.map((p) => pt(p, half)).join("L")}Z`;
    const id = `ln-cb-${half > 0 ? "top" : "bottom"}`;
    const fibres = [0.3, 0.6, 0.9].map((f) => `M${pt([eq.s - 1.6, ring.outer - f], half)}L${pt([eq.s + 3.6, ring.outer - f - 0.2], half)}`).join("");
    out.push(`<clipPath id="${id}"><path d="${d}"/></clipPath><path class="ln-cb" d="${d}"/><path class="iso-line" data-tone="faint" clip-path="url(#${id})" d="${fibres}"/><path class="iso-line" data-tone="lo" d="${d}"/>`);
    // zonules
    const lines = zonules.flatMap((z) => [0, 0.18].map((o) => {
      const a = [z.from[0] + o, z.from[1]];
      const b = z.to;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 - 2 * z.sag;
      return `M${pt(a, half)}Q${pt([mx, my], half)} ${pt(b, half)}`;
    }));
    out.push(`<path class="ln-zonule" d="${lines.join("")}"/>`);
  }
  // lens: cortex, then the nuclei inward, then the capsule
  out.push(`<path class="ln-cortex" d="${shape(profile)}"/>`);
  LAYERS.forEach((layer, i) => out.push(`<path class="ln-layer" data-layer="${i}" d="${shape(scaled(layer.axial, layer.radial))}"/>`));
  const front = profile.filter(([s]) => s <= eq.s);
  const back = profile.filter(([s]) => s >= eq.s);
  for (const half of [1, -1]) {
    out.push(`<path class="ln-capsule" data-side="front" d="M${front.map((p) => pt(p, half)).join("L")}"/>`);
    out.push(`<path class="ln-capsule" data-side="back" d="M${back.map((p) => pt(p, half)).join("L")}"/>`);
  }
  // epithelium: one row of cells under the anterior capsule only, ending at the equator in the lens bow
  const cells = [];
  let walked = 0;
  for (let i = 1; i < front.length; i++) {
    const [s0, r0] = front[i - 1];
    const [s1, r1] = front[i];
    const length = Math.hypot(s1 - s0, r1 - r0);
    const [ns, nr] = [-(r1 - r0) / length, (s1 - s0) / length];
    for (let t = walked === 0 ? 0 : (0.28 - (walked % 0.28)) / length; t <= 1; t += 0.28 / length) {
      const s = s0 + (s1 - s0) * t;
      const r = r0 + (r1 - r0) * t;
      cells.push([s - ns * 0.14, r - nr * 0.14]);
    }
    walked += length;
  }
  const bow = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    return [eq.s + 0.15 + 0.55 * t, eq.r - 0.2 - 1.3 * t * t];
  });
  const dots = (list) => list.flatMap((p) => [1, -1].map((half) => `M${(X(p[0]) - 0.45).toFixed(2)} ${Y(p[1], half).toFixed(2)}a0.45 0.45 0 1 0 0.9 0a0.45 0.45 0 1 0 -0.9 0`)).join("");
  out.push(`<path class="ln-cell" d="${dots(cells.filter(([, r]) => r > 0.2))}"/><path class="ln-cell ln-bow" d="${dots(bow)}"/>`);
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
  // a millimetre rule along the front edge: 1 mm = 8 units, a major tick every 5 mm
  const strip = { x: PLATE.x + 22, y: PLATE.y + PLATE.d - 15, w: PLATE.w - 44, d: 7, r: 1 };
  out.push(S(slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, U, 5, strip.y, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  const label = { x: PLATE.x + 16, y: 28, w: 50, d: 12, r: 1.2 };
  out.push(S(slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(planOutline(insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(L([32, 22, 27].map((w, i) => k.lineOnTop([label.x + 5, label.y + 3.6 + i * 2.4], [label.x + 5 + w, label.y + 3.6 + i * 2.4], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 4, label.y + 3.2, 0.8]), at([label.x + label.w - 4, label.y + label.d - 3.2, 0.8])], { size: 0.45 }));
  return out.join("");
}

function stand() {
  const out = [`<path class="iso-halo" d="${k.haloOf(STAND, 0, 4, P)}"/>`];
  out.push(S(slabOf(STAND, 0, 6, P, 4, 0.8), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(STAND, 3), 6, P, 4), { tone: "faint" }));
  out.push(D(k.corners(STAND, 5).map(([x, y]) => at([x, y, 6])), { size: 0.45 }));
  return out.join("");
}

function holder() {
  const out = [`<path class="iso-halo" d="${k.haloOf(HOLDER, 0, 4, P)}"/>`];
  out.push(S(slabOf(HOLDER, 0, HOLDER_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(PANEL, -1), HOLDER_H, P, 3), { tone: "lo" }));
  out.push(D([[HOLDER.x + 5, HOLDER.y + 4], [HOLDER.x + HOLDER.w - 5, HOLDER.y + 4], [HOLDER.x + 5, HOLDER.y + HOLDER.d - 4], [HOLDER.x + HOLDER.w - 5, HOLDER.y + HOLDER.d - 4]].map(([x, y]) => at([x, y, HOLDER_H])), { size: 0.45 }));
  out.push(S(slabOf(PANEL, HOLDER_H, PANEL_Z[1] - HOLDER_H, P, 3, 0.6), { tone: "mid" }));
  return out.join("");
}

function panelFace(sc) {
  const face = sideMatrix([0, PANEL_FRONT], 0, P, "left");
  const x0 = PANEL.x + 4;
  const x1 = PANEL.x + PANEL.w - 4;
  const z0 = HOLDER_H + 4;
  const z1 = PANEL_Z[1] - 4;
  const frame = `M${x0} ${-z0}H${x1}V${-z1}H${x0}Z`;
  return `<g transform="${face}"><clipPath id="ln-panel"><path d="${frame}"/></clipPath><path class="ln-glass" d="${frame}"/><g clip-path="url(#ln-panel)" data-part="section">${sectionSvg(sc)}</g><path class="iso-line" data-tone="lo" d="${frame}"/></g>`;
}

// ---- the page ----

const START = { age: 25, demand: 0 };
const first = sceneOf(START.age, START.demand);
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "수정체 해부 모형. 왼쪽 받침대 위에는 모양체 고리 안에 섬모소대로 매달린 수정체가 있고 앞면이 오른쪽을 향한다. 오른쪽 판은 같은 순간의 경선 단면으로, 수정체낭, 앞면 아래 한 줄의 상피, 피질과 성인핵·태아핵·배아핵, 위아래의 모양체와 소대를 보여준다. 근거리를 볼수록 모양체근이 수축해 고리가 좁아지고 소대가 느슨해지며 수정체가 두꺼워진다.",
  body: [plate(), stand(), `<g data-part="model">${modelSvg(first)}</g>`, holder(), panelFace(first)],
});

const fn = (f) => f.toString();
const live = `
${latheScript()}
${moduleScript(new URL("./model.mjs", import.meta.url))}
const P = ${JSON.stringify(P)};
const { ${Object.keys(C).join(", ")} } = ${JSON.stringify(C)};
${fn(modelSvg)}
${fn(sectionSvg)}
const TOUR = [[25, 0], [25, 4], [25, 8], [25, 0], [60, 0], [60, 4], [60, 8], [60, 0]];
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const modelEl = svg.querySelector('[data-part="model"]');
const sectionEl = svg.querySelector('[data-part="section"]');
const readout = document.querySelector("[data-readout]");
const status = document.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const follow = (x, target, dt, tau, calm) => (calm ? target : x + (target - x) * (1 - Math.exp(-dt / tau)));
let want = { age: ${START.age}, demand: ${START.demand} };
let shown = { ...want };
let drawnKey = "";
let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0;

function draw() {
  const key = shown.age.toFixed(2) + "|" + shown.demand.toFixed(3);
  if (key !== drawnKey) {
    drawnKey = key;
    const sc = sceneOf(shown.age, shown.demand);
    modelEl.innerHTML = modelSvg(sc);
    sectionEl.innerHTML = sectionSvg(sc);
  }
  const sc = sceneOf(Math.round(shown.age), shown.demand);
  const text = Math.round(shown.age) + "세 · 요구 " + shown.demand.toFixed(1) + " D → 조절 " + sc.A.toFixed(1) + " D · 두께 " + sc.lens.T.toFixed(2) + " mm";
  if (readout.textContent !== text) readout.textContent = text;
}
function describe() {
  const sc = sceneOf(want.age, want.demand);
  const text = want.age + "세, 근거리 요구 " + want.demand.toFixed(1) + " 디옵터, 실제 조절 " + sc.A.toFixed(1) + " 디옵터, 수정체 두께 " + sc.lens.T.toFixed(2) + " 밀리미터, 굴절력 " + sc.lens.power.toFixed(1) + " 디옵터";
  stage.setAttribute("aria-valuenow", want.demand.toFixed(1));
  stage.setAttribute("aria-valuetext", text);
  status.textContent = text + ".";
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) {
    clock += dt;
    const [age, demand] = TOUR[Math.floor(clock / 2.6) % TOUR.length];
    if (age !== want.age || demand !== want.demand) { want = { age, demand }; describe(); }
  }
  shown.age = follow(shown.age, want.age, dt, 0.5, calm);
  shown.demand = follow(shown.demand, want.demand, dt, 0.4, calm);
  if (Math.abs(shown.age - want.age) < 0.01) shown.age = want.age;
  if (Math.abs(shown.demand - want.demand) < 0.002) shown.demand = want.demand;
  draw();
  const settled = !touring && shown.age === want.age && shown.demand === want.demand;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
function steer(next) {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 3600);
  want = { age: Math.max(AGE_RANGE[0], Math.min(AGE_RANGE[1], next.age)), demand: Math.max(0, Math.min(DEMAND_MAX, next.demand)) };
  describe();
  run();
}
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.12) / 0.76));
  steer({ age: want.age, demand: Math.round(share * DEMAND_MAX * 4) / 4 });
});
stage.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 2 : 0.5;
  let next = { ...want };
  if (event.key === "ArrowRight") next.demand += step;
  else if (event.key === "ArrowLeft") next.demand -= step;
  else if (event.key === "ArrowUp") next.age += 5;
  else if (event.key === "ArrowDown") next.age -= 5;
  else if (event.key === "Home") next.demand = 0;
  else if (event.key === "End") next.demand = DEMAND_MAX;
  else return;
  event.preventDefault();
  steer(next);
});
if (still.matches) touring = false;
describe();
draw();
`;

const css = `<style>
.ln-ring .iso-edge{stroke:var(--anatomy-lo)}
.ln-zonule{fill:none;stroke:var(--anatomy-lo);stroke-width:.45px;vector-effect:non-scaling-stroke;stroke-linecap:round}
.ln-glass{fill:var(--anatomy-paper)}
.ln-cb{fill:var(--anatomy-shade-1)}
.ln-cortex{fill:var(--anatomy-lit-top)}
.ln-layer{stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.ln-layer[data-layer="0"]{fill:var(--anatomy-top)}
.ln-layer[data-layer="1"]{fill:var(--anatomy-shade-3)}
.ln-layer[data-layer="2"]{fill:var(--anatomy-shade-2)}
.ln-capsule{fill:none;stroke:var(--anatomy-lit);stroke-linejoin:round;vector-effect:non-scaling-stroke}
.ln-capsule[data-side="front"]{stroke-width:1.15px}
.ln-capsule[data-side="back"]{stroke-width:.6px}
.ln-cell{fill:var(--anatomy-mid)}
.ln-bow{fill:var(--anatomy-hi)}
.ln-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage{touch-action:pan-y}
.iso-stage:focus{outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:520px){.iso-plate{overflow:hidden}.iso-stage svg{width:112%;margin:0 -6% -2%}}
</style>`;

const body =
  css +
  k.plateHtml({
    fig: "Fig 1",
    title: "수정체 · Crystalline lens",
    hint: "마우스 → 가까이 보기 · ↑ ↓ 나이",
    readout: `${START.age}세 · 요구 0.0 D → 조절 0.0 D · 두께 ${first.lens.T.toFixed(2)} mm`,
    keys: [
      { mark: "lit", label: "수정체: 조절하면 두꺼워지고 앞면이 더 둥글어짐" },
      { mark: "raised", label: "모양체 고리: 근육이 수축하면 지름이 최대 0.64 mm 줄어듦" },
      { mark: "edge", label: "섬모소대(Zinn 소대): 고리가 좁아지면 장력이 풀림" },
      { mark: "flat", label: "단면판: 수정체낭 · 앞면 상피 · 피질 · 성인핵 · 태아핵 · 배아핵" },
    ],
    caption:
      "왼쪽은 모양체 고리에 섬모소대로 매달린 수정체 모형(앞면이 오른쪽), 오른쪽 판은 같은 순간의 경선 단면입니다. 마우스를 오른쪽으로 옮기면 근거리 요구가 0에서 8 D까지 커집니다. 모양체근이 수축하면 고리가 좁아지고 소대의 장력이 풀려, 수정체가 제 탄성으로 두꺼워지고(+0.064 mm/D) 앞면 곡률반경이 줄어 굴절력이 커집니다. 조절력은 평균 18.5 − 0.3×나이(Hofstetter)라서, 60세에서는 근육과 소대가 똑같이 움직여도 수정체는 0.5 D밖에 따라가지 못합니다(노안). 곡률·두께·굴절률은 Dubbelman, 조절 시 두께는 Richdale(2013), 고리 수축은 Strenk(2006)의 값이고, 층 비율과 소대 처짐은 도식입니다. 수정체낭 두께는 실제 수~수십 µm로 그림에서는 과장했습니다.",
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="수정체 조절 모형. 좌우 화살표로 근거리 요구를, 위아래 화살표로 나이를 바꿉니다." aria-valuemin="0" aria-valuemax="${M.DEMAND_MAX}" aria-valuenow="0">${svg}<span class="ln-sr" role="status" aria-live="polite" data-status></span></div>`,
  });

const name = theme === "light" ? "lens-light.html" : "lens.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "수정체 해부", theme, body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="ko">'));
console.log("wrote", name);
