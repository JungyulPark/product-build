// 상안검(upper eyelid): 동공을 지나는 시상 단면 표본(두께 8 mm)과 정면 MRD1 측정판.
// node figures/upper-eyelid/build.mjs [--light]  →  upper-eyelid.html / upper-eyelid-light.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, kitScript, latheScript, moduleScript } from "../../scripts/kit.mjs";
import * as M from "./model.mjs";
import * as LENS from "../lens/model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const { slabOf, cylinder, solidSvg, lineSvg, dotsSvg, planOutline, insetPlan, iso, depthOf, sideMatrix, pathOf, fadeLineSvg } = k;
const { lidOf, VARIANTS, VARIANT_KEYS, GAZE, WHITNALL, APEX, levatorFunction } = M;

const WIDTH = 600;
const HEIGHT = 440;

// 30세 비조절 수정체의 단면 (수정체 그림과 같은 모형), 전극에서 [s, r] mm.
const LENS_PROFILE = LENS.profileOf(LENS.lensOf(30, 0), 40).map(([s, r]) => [Number(s.toFixed(3)), Number(r.toFixed(3))]);

const C = {
  U: 6.2, // 단면 1 mm = 6.2 units
  FU: 4.4, // 정면판 1 mm = 4.4 units
  CROP: { a: [-7, 19.5], v: [-11.5, 25.5] },
  SX: -108, // a = 0 의 world x
  SZ: 81.3, // v = 0 의 world z
  SY: 26, // 단면(앞면)의 world y
  DEPTH: 44, // 표본 두께 약 7 mm
  PLATE: { x: -196, y: -40, w: 410, d: 112, r: 9 },
  PLATE_H: 12,
  FOOT_H: 5,
  SLOT: { x: -160, y: -26, w: 182, d: 60, r: 3 },
  PANEL: { x: 36, y: 30, w: 160, d: 4, r: 1 },
  PANEL_Z: [10, 160],
  FRONT: [116, 60], // 정면판에서 각막반사(정면 주시)의 world x, z
  HOLDER: { x: 28, y: 22, w: 176, d: 20, r: 2 },
  BASE_H: 10,
};
const { U, FU, CROP, SX, SZ, SY, DEPTH, PLATE, PLATE_H, FOOT_H, SLOT, PANEL, PANEL_Z, FRONT, HOLDER, BASE_H } = C;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(PANEL, PANEL_Z[0], PANEL_Z[1]), [SX + CROP.a[0] * U, SY - DEPTH, SZ + CROP.v[1] * U], [SX + CROP.a[1] * U, SY, SZ + CROP.v[1] * U], [SX + 26 * U, SY, SZ]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 52, elevation: 27 },
);
const at = (point) => iso(point, P);
const S = (paths, style) => solidSvg(paths, style);
const L = (d, style) => lineSvg(d, style);
const D = (points, style) => dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P));

// ---- shared with the page ----

// 단면(a, v) mm → 단면 면의 로컬 좌표 (x = world x, y = −world z).
function sp([a, v]) {
  return [SX + a * U, -(SZ + v * U)];
}
function spath(points, closed = false) {
  return pathOf(points.map(sp), closed);
}
// 표본의 앞쪽 윤곽: 아래눈꺼풀 피부 → 아래 테 → 드러난 각막·결막 → 위 테 → 위 피부 → 위쪽 절단면.
function contourOf(lid) {
  const eye = (phi, extra) => {
    const r = M.eyeRadius(phi - lid.g) + extra;
    return [r * Math.cos(phi), r * Math.sin(phi)];
  };
  const lowerAngle = Math.atan2(lid.lowerFront[1], lid.lowerFront[0]);
  const upperAngle = Math.atan2(lid.marginFront[1], lid.marginFront[0]);
  const exposed = [];
  for (let phi = lowerAngle; phi <= upperAngle; phi += 0.02) exposed.push(eye(phi, 0.02));
  const skin = lid.skinLine;
  const top = skin[skin.length - 1];
  return [[lid.lowerSkin[0][0], CROP.v[0]], ...lid.lowerSkin, eye(lowerAngle, 0), ...exposed, eye(upperAngle, 0), ...skin, [CROP.a[0], top[1]]];
}
function faceOf(contour) {
  return [[CROP.a[0], CROP.v[0]], ...contour, [CROP.a[0], CROP.v[1]]];
}

// 단면 위의 모든 조직, 뒤에서 앞으로.
function sectionSvg(lid) {
  const contour = contourOf(lid);
  const face = faceOf(contour);
  const faceD = spath(face, true);
  const bandD = (centre, half) => spath(lid.band ? M.offset(centre, half).concat(M.offset(centre, typeof half === "function" ? (t) => -half(t) : -half).reverse()) : centre, true);
  const rot = (p) => [p[0] * Math.cos(lid.g) - p[1] * Math.sin(lid.g), p[0] * Math.sin(lid.g) + p[1] * Math.cos(lid.g)];
  const eyeAt = (phi, extra) => {
    const r = M.eyeRadius(phi - lid.g) + extra;
    return [r * Math.cos(phi), r * Math.sin(phi)];
  };
  const out = [`<clipPath id="ul-face"><path d="${faceD}"/></clipPath>`, `<g clip-path="url(#ul-face)">`];
  out.push(`<path class="ul-tissue" d="${faceD}"/>`);
  // 안와 천장(전두골)과 안와테두리
  const bone = [[-12, 19.6], [-2, 20.2], [5, 20.4], [8.4, 19.9], [9.8, 19.6], [10.6, 20.4], [10.7, 22.4], [10.3, 24.6], [9.9, 27], [-12, 27]];
  const boneD = spath(M.spline(bone, 6), true);
  const grain = [];
  for (let a = -11; a < 11; a += 1.4) for (let v = 20.8; v < 26.5; v += 1.3) grain.push(sp([a + ((v * 7) % 1.4) * 0.5, v]));
  out.push(`<clipPath id="ul-bone"><path d="${boneD}"/></clipPath><path class="ul-bone" d="${boneD}"/><g clip-path="url(#ul-bone)">${grain.map(([x, y]) => `<circle class="ul-grain" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="0.5"/>`).join("")}</g><path class="iso-line" data-tone="lo" d="${boneD}"/>`);
  // 안구: 공막·각막 벽, 방수·유리체, 홍채, 수정체 (시선만큼 회전)
  out.push(`<path class="ul-sclera" d="${spath(lid.globe, true)}"/>`);
  const inner = [];
  for (let i = 0; i <= 180; i++) {
    const d = -Math.PI + (i / 180) * 2 * Math.PI;
    const wall = Math.abs(d) < 0.46 ? 0.55 : 1.0;
    inner.push(eyeAt(lid.g + d, -wall));
  }
  out.push(`<path class="ul-humor" d="${spath(inner, true)}"/>`);
  const pole = APEX - 3.55;
  const lensPts = [...LENS_PROFILE.map(([s, r]) => [pole - s, r]), ...[...LENS_PROFILE].reverse().map(([s, r]) => [pole - s, -r])].map(rot);
  out.push(`<path class="ul-lens" d="${spath(lensPts, true)}"/><path class="iso-line" data-tone="lo" d="${spath(lensPts, true)}"/>`);
  out.push(`<path class="ul-iris" d="${spath(lid.iris, true)}${spath(lid.irisBelow, true)}"/><path class="iso-line" data-tone="lo" d="${spath(lid.iris, true)}${spath(lid.irisBelow, true)}"/>`);
  out.push(`<path class="iso-line" data-tone="lo" d="${spath(lid.globe, true)}${spath(inner, true)}"/>`);
  // 상직근, 거근 근복, 건막 앞 지방, Whitnall 인대
  out.push(`<path class="ul-muscle" d="${bandD(lid.sr, (t) => 0.2 + 0.8 * Math.min(1, t * 5))}"/><path class="iso-line" data-tone="lo" d="${bandD(lid.sr, (t) => 0.2 + 0.8 * Math.min(1, t * 5))}"/>`);
  out.push(`<path class="ul-muscle" d="${bandD(lid.muscle, lid.belly)}"/><path class="iso-line" data-tone="lo" d="${bandD(lid.muscle, lid.belly)}"/>`);
  const fatD = spath(M.spline(lid.fat.slice(0, -2), 2).concat(lid.fat.slice(-2)), true);
  const lobes = [];
  for (let a = -6; a < 13; a += 1.5) for (let v = 4; v < 19; v += 1.5) lobes.push(sp([a + (v % 3 === 0 ? 0.75 : 0), v]));
  out.push(`<clipPath id="ul-fat"><path d="${fatD}"/></clipPath><path class="ul-fat" d="${fatD}"/><g clip-path="url(#ul-fat)">${lobes.map(([x, y]) => `<circle class="ul-lobe" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.62 * U).toFixed(1)}"/>`).join("")}</g>`);
  const [wx, wy] = sp([WHITNALL[0], WHITNALL[1] + 0.2]);
  out.push(`<ellipse class="ul-tendon" cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" rx="${(1.9 * U).toFixed(1)}" ry="${(0.65 * U).toFixed(1)}"/><ellipse class="iso-line" data-tone="lo" cx="${wx.toFixed(1)}" cy="${wy.toFixed(1)}" rx="${(1.9 * U).toFixed(1)}" ry="${(0.65 * U).toFixed(1)}"/>`);
  // 검판(+ 마이봄샘), 뮐러근, 건막, 격막
  const tarsusD = bandD(lid.tarsus, 0.5);
  out.push(`<path class="ul-tarsus" d="${tarsusD}"/><path class="iso-line" data-tone="lo" d="${tarsusD}"/>`);
  out.push(`<path class="iso-line" data-tone="faint" d="${spath(lid.meibom)}"/>`);
  out.push(`<path class="ul-tarsus" d="${bandD(lid.lowerTarsus, 0.45)}"/><path class="iso-line" data-tone="lo" d="${bandD(lid.lowerTarsus, 0.45)}"/>`);
  out.push(`<path class="ul-smooth" d="${bandD(lid.muller, 0.32)}"/><path class="iso-line" data-tone="lo" d="${bandD(lid.muller, 0.32)}"/>`);
  out.push(`<path class="ul-tendon" d="${bandD(lid.aponeurosis, 0.2)}"/><path class="iso-line" data-tone="mid" d="${bandD(lid.aponeurosis, 0.2)}"/>`);
  out.push(`<path class="ul-tendon" d="${bandD(lid.septum, 0.16)}"/><path class="iso-line" data-tone="mid" d="${bandD(lid.septum, 0.16)}"/>`);
  // 결막 (테 뒤에서 원개를 돌아 각막 가장자리까지)
  out.push(`<path class="ul-conj" d="${spath(lid.conjunctiva)}"/>`);
  // 안륜근과 피부: 피부선을 굵게 긋고 조직 안쪽만 남김
  const skinD = spath(lid.skinLine);
  const lowerD = spath(lid.lowerSkin);
  out.push(`<path class="ul-orbicularis" d="${skinD}${lowerD}" style="stroke-width:${(2 * 1.15 * U).toFixed(1)}"/>`);
  out.push(`<path class="ul-skin" d="${skinD}${lowerD}" style="stroke-width:${(2 * 0.45 * U).toFixed(1)}"/>`);
  out.push(`</g>`);
  out.push(`<path class="iso-line" data-tone="hi" d="${faceD}"/>`);
  // 회색선(gray line)과 속눈썹
  out.push(`<circle class="ul-dot" cx="${sp(lid.marginFront)[0].toFixed(1)}" cy="${sp(lid.marginFront)[1].toFixed(1)}" r="0.7"/>`);
  out.push(`<path class="ul-lash" data-free="end" d="${[...lid.lashes, ...lid.lowerLashes].map((lash) => spath(lash)).join("")}"/>`);
  return out.join("");
}

// 표본의 두께: 앞쪽 윤곽을 뒤로 8 mm 뽑은 띠, 보이는 면만 면 방향으로 음영.
function slabSvg(lid) {
  const contour = contourOf(lid);
  const V = G.viewOf(P);
  const world = ([a, v], y) => [SX + a * U, y, SZ + v * U];
  const quads = [];
  const backEdges = [];
  for (let i = 1; i < contour.length; i++) {
    const p = contour[i - 1];
    const q = contour[i];
    const d = [q[0] - p[0], q[1] - p[1]];
    const n = [d[1], 0, -d[0]];
    if (Math.hypot(d[0], d[1]) < 1e-6 || G.dot3(n, V) <= 0) continue;
    const corners = [world(p, SY), world(q, SY), world(q, SY - DEPTH), world(p, SY - DEPTH)];
    const tone = G.toneOf(n, P);
    const mid = G.mul3(G.add3(corners[0], corners[2]), 0.5);
    quads.push({ key: G.dot3(mid, V), d: pathOf(corners.map((c) => iso(c, P)), true), tone });
    backEdges.push(pathOf([iso(corners[3], P), iso(corners[2], P)]));
  }
  quads.sort((a, b) => a.key - b.key);
  const colour = (tone) => (tone >= 4 ? "var(--anatomy-top)" : `var(--anatomy-shade-${tone})`);
  const fill = quads.map((qd) => `<path class="${qd.tone >= 4 ? "iso-top" : "iso-shade"}"${qd.tone >= 4 ? "" : ` data-shade="${qd.tone}"`} d="${qd.d}" style="stroke:${colour(qd.tone)};stroke-width:.6px;stroke-linejoin:round"/>`).join("");
  const along = [lid.marginFront, lid.lowerFront, lid.skinLine[lid.skinLine.length - 1]];
  if (lid.variant.fold) along.push(lid.skinLine[Math.floor(lid.skinLine.length * 0.36)]);
  const depthLines = along.map((p) => pathOf([iso(world(p, SY), P), iso(world(p, SY - DEPTH), P)])).join("");
  return `<g class="ul-slab">${fill}<path class="iso-line" data-tone="lo" d="${backEdges.join("")}"/><path class="iso-line" data-tone="faint" d="${depthLines}"/></g>`;
}

// 정면 측정판: 오른눈(코 쪽이 오른쪽), 각막반사와 위 테 사이가 MRD1.
function frontSvg(lid) {
  const [fx, fz] = FRONT;
  const fp = ([h, v]) => [fx + h * FU, -(fz + v * FU)];
  const fpath = (points, closed = false) => pathOf(points.map(fp), closed);
  const f = lid.front;
  const quad = (p0, p1, p2, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return [0, 1].map((k2) => (1 - t) ** 2 * p0[k2] + 2 * t * (1 - t) * p1[k2] + t * t * p2[k2]);
  });
  const lateral = [-14.5, 0.9 + f.reflex[1] * 0.5];
  const medial = [13.5, -0.6 + f.reflex[1] * 0.5];
  const upper = quad(lateral, [0.5, 2 * f.upper - (lateral[1] + medial[1]) / 2], medial);
  const lower = quad(lateral, [-0.5, 2 * f.lower - (lateral[1] + medial[1]) / 2], medial);
  const fissure = [...upper, ...[...lower].reverse()];
  const out = [];
  out.push(`<clipPath id="ul-fissure"><path d="${fpath(fissure, true)}"/></clipPath>`);
  out.push(`<path class="ul-sclera" d="${fpath(fissure, true)}"/>`);
  const [rx, ry] = fp(f.reflex);
  out.push(`<g clip-path="url(#ul-fissure)"><circle class="ul-iris" cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="${(5.85 * FU).toFixed(1)}"/><circle class="iso-line" data-tone="lo" cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="${(5.85 * FU).toFixed(1)}"/><circle class="ul-pupil" cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="${(2 * FU).toFixed(1)}"/><ellipse class="ul-caruncle" cx="${fp([12.2, -0.2])[0].toFixed(1)}" cy="${fp([12.2, -0.2])[1].toFixed(1)}" rx="${(1.2 * FU).toFixed(1)}" ry="${(1.6 * FU).toFixed(1)}"/></g>`);
  out.push(`<path class="iso-line" data-tone="hi" d="${fpath(upper)}"/><path class="iso-line" data-tone="mid" d="${fpath(lower)}"/>`);
  // 속눈썹
  const lash = [];
  for (let i = 2; i < upper.length - 2; i += 2) {
    const [h, v] = upper[i];
    lash.push(fpath([[h, v], [h - 0.25 + h * 0.03, v + 1.6], [h - 0.6 + h * 0.06, v + 2.4]]));
  }
  for (let i = 4; i < lower.length - 4; i += 3) {
    const [h, v] = lower[i];
    lash.push(fpath([[h, v], [h - 0.3, v - 1.4]]));
  }
  out.push(`<path class="ul-lash" data-free="end" d="${lash.join("")}"/>`);
  // 쌍꺼풀 주름과 피부 접힘선, 눈썹
  const shifted = (dv, from, to) => upper.slice(from, to).map(([h, v]) => [h, v + dv * (1 - ((h - 0.5) / 16) ** 2)]);
  if (f.crease !== null) out.push(fadeLineSvg(shifted(f.crease - f.upper, 3, 22).map(fp), { fade: [8, 8], tone: "lo" }));
  out.push(fadeLineSvg(shifted(f.fold - f.upper, 2, 23).map(fp), { fade: [10, 10], tone: "mid" }));
  out.push(fadeLineSvg(quad([-15, 17.5], [0, 22.5], [14, 18.5], 20).map(fp), { fade: [14, 14], tone: "lo" }));
  // MRD1: 각막반사에서 위 테까지
  const [ux, uy] = fp([0, f.upper]);
  out.push(`<path class="iso-line" data-tone="lit" d="M${rx.toFixed(1)} ${ry.toFixed(1)}V${uy.toFixed(1)}" style="stroke-width:1px"/><circle class="ul-reflex" cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="1.3"/><circle class="ul-reflex" cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="1"/>`);
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
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, U, 5, strip.y, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  return out.join("");
}

function slot() {
  const out = [`<path class="iso-halo" d="${k.haloOf(SLOT, 0, 4, P)}"/>`];
  out.push(S(slabOf(SLOT, 0, BASE_H, P, 4, 0.8), { tone: "mid" }));
  const groove = { x: SX + CROP.a[0] * U - 1, y: SY - DEPTH - 1, w: (CROP.a[1] - CROP.a[0]) * U + 2, d: DEPTH + 2, r: 1 };
  out.push(L(planOutline(groove, BASE_H, P, 3), { tone: "lo" }));
  out.push(D(k.corners(SLOT, 5).map(([x, y]) => at([x, y, BASE_H])), { size: 0.45 }));
  return out.join("");
}

function holder() {
  const out = [`<path class="iso-halo" d="${k.haloOf(HOLDER, 0, 4, P)}"/>`];
  out.push(S(slabOf(HOLDER, 0, BASE_H, P, 4, 0.8), { tone: "mid" }));
  out.push(L(planOutline(insetPlan(PANEL, -1), BASE_H, P, 3), { tone: "lo" }));
  out.push(D(k.corners(HOLDER, 5).map(([x, y]) => at([x, y, BASE_H])), { size: 0.45 }));
  out.push(S(slabOf(PANEL, BASE_H, PANEL_Z[1] - BASE_H, P, 3, 0.6), { tone: "mid" }));
  return out.join("");
}

function panelFace(lid) {
  const face = sideMatrix([0, PANEL.y + PANEL.d], 0, P, "left");
  const x0 = PANEL.x + 4;
  const x1 = PANEL.x + PANEL.w - 4;
  const z0 = BASE_H + 4;
  const z1 = PANEL_Z[1] - 4;
  const frame = `M${x0} ${-z0}H${x1}V${-z1}H${x0}Z`;
  // 오른쪽 가장자리의 mm 자: 0이 정면 주시 각막반사 높이
  const rule = { x0: x1 - 9, x1: x1 - 4 };
  const ticks = [];
  for (let mm = -8; mm <= 20; mm++) {
    const y = -(FRONT[1] + mm * FU);
    const long = mm % 5 === 0;
    ticks.push(`M${rule.x0} ${y.toFixed(1)}H${(rule.x0 - (long ? 3.2 : 1.8)).toFixed(1)}`);
  }
  const ruler = `<path class="ul-rule" d="M${rule.x0} ${-(FRONT[1] - 8.6 * FU)}H${rule.x1}V${-(FRONT[1] + 20.6 * FU)}H${rule.x0}Z"/><path class="iso-line" data-tone="lo" d="M${rule.x0} ${-(FRONT[1] - 8.6 * FU)}H${rule.x1}V${-(FRONT[1] + 20.6 * FU)}H${rule.x0}Z"/><path class="iso-line" data-tone="mid" d="${ticks.join("")}"/><path class="iso-line" data-tone="hi" d="M${rule.x0} ${-FRONT[1]}H${rule.x0 - 4.5}"/>`;
  return `<g transform="${face}"><clipPath id="ul-panel"><path d="${frame}"/></clipPath><path class="ul-card" d="${frame}"/><g clip-path="url(#ul-panel)" data-part="front">${frontSvg(lid)}</g>${ruler}<path class="iso-line" data-tone="lo" d="${frame}"/></g>`;
}

// ---- the page ----

const START = { gaze: 0, key: "double" };
const first = lidOf(START.gaze, START.key);
const sectionFace = sideMatrix([0, SY], 0, P, "left");
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "상안검 해부 모형. 왼쪽은 동공을 지나는 두께 8 mm의 시상 단면 표본으로, 앞쪽이 오른쪽이다. 피부와 안륜근, 안와격막과 건막 앞 지방, 상안검거근과 그 건막, 뮐러근, 검판과 마이봄샘, 결막, Whitnall 인대, 안와 천장, 상직근, 안구와 아래눈꺼풀이 보인다. 오른쪽 판은 같은 눈의 정면으로, 각막반사에서 윗눈꺼풀 테까지의 거리(MRD1)를 잰다. 시선을 올리면 거근이 수축해 건막과 검판을 끌어올린다.",
  body: [plate(), slot(), `<g data-part="slab">${slabSvg(first)}</g>`, `<g transform="${sectionFace}" data-part="section">${sectionSvg(first)}</g>`, holder(), panelFace(first)],
});

const fn = (f) => f.toString();
const live = `
${latheScript()}
const M = (() => {
${moduleScript(new URL("./model.mjs", import.meta.url))}
return { lidOf, VARIANTS, VARIANT_KEYS, GAZE, WHITNALL, APEX, eyeRadius, offset, spline, levatorFunction };
})();
const P = ${JSON.stringify(P)};
const LENS_PROFILE = ${JSON.stringify(LENS_PROFILE)};
const { ${Object.keys(C).join(", ")} } = ${JSON.stringify(C)};
const { WHITNALL, APEX } = M;
${fn(sp)}
${fn(spath)}
${fn(contourOf)}
${fn(faceOf)}
${fn(sectionSvg)}
${fn(slabSvg)}
${fn(frontSvg)}
const TOUR = [["double", 0], ["double", -25], ["double", 25], ["double", 0], ["single", 0], ["single", 25], ["aponeurotic", 0], ["aponeurotic", 25]];
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const slabEl = svg.querySelector('[data-part="slab"]');
const sectionEl = svg.querySelector('[data-part="section"]');
const frontEl = svg.querySelector('[data-part="front"]');
const readout = document.querySelector("[data-readout]");
const status = document.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const follow = (x, target, dt, tau, calm) => (calm ? target : x + (target - x) * (1 - Math.exp(-dt / tau)));
let want = { key: "${START.key}", gaze: ${START.gaze} };
let shown = { gaze: want.gaze };
let drawnKey = "";
let frame = 0, last = 0, clock = 0, touring = !still.matches, visible = false, idleTimer = 0;
const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toFixed(0);

function draw() {
  const key = want.key + "|" + shown.gaze.toFixed(2);
  if (key === drawnKey) return;
  drawnKey = key;
  const lid = M.lidOf(shown.gaze, want.key);
  slabEl.innerHTML = slabSvg(lid);
  sectionEl.innerHTML = sectionSvg(lid);
  frontEl.innerHTML = frontSvg(lid);
  const text = lid.variant.name + " · 시선 " + signed(Math.round(shown.gaze)) + "° · 거근 " + lid.excursion.toFixed(1) + " mm · MRD1 " + lid.mrd1.toFixed(1) + " mm";
  if (readout.textContent !== text) readout.textContent = text;
}
function describe() {
  const lid = M.lidOf(want.gaze, want.key);
  const text = lid.variant.name + ", 시선 " + want.gaze + "도, 거근이 당긴 거리 " + lid.excursion.toFixed(1) + " 밀리미터, MRD1 " + lid.mrd1.toFixed(1) + " 밀리미터";
  stage.setAttribute("aria-valuenow", String(want.gaze));
  stage.setAttribute("aria-valuetext", text);
  status.textContent = text + ".";
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) {
    clock += dt;
    const [key, gaze] = TOUR[Math.floor(clock / 2.6) % TOUR.length];
    if (key !== want.key || gaze !== want.gaze) { want = { key, gaze }; describe(); }
  }
  shown.gaze = follow(shown.gaze, want.gaze, dt, 0.35, calm);
  if (Math.abs(shown.gaze - want.gaze) < 0.02) shown.gaze = want.gaze;
  draw();
  const settled = !touring && shown.gaze === want.gaze;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
function steer(next) {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 3600);
  want = { key: next.key, gaze: Math.max(M.GAZE[0], Math.min(M.GAZE[1], next.gaze)) };
  describe();
  run();
}
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.12) / 0.76));
  steer({ key: want.key, gaze: Math.round(M.GAZE[0] + share * (M.GAZE[1] - M.GAZE[0])) });
});
stage.addEventListener("keydown", (event) => {
  const next = { ...want };
  const index = M.VARIANT_KEYS.indexOf(want.key);
  if (event.key === "ArrowRight") next.gaze += 5;
  else if (event.key === "ArrowLeft") next.gaze -= 5;
  else if (event.key === "ArrowUp") next.key = M.VARIANT_KEYS[(index + 1) % M.VARIANT_KEYS.length];
  else if (event.key === "ArrowDown") next.key = M.VARIANT_KEYS[(index + M.VARIANT_KEYS.length - 1) % M.VARIANT_KEYS.length];
  else if (["1", "2", "3"].includes(event.key)) next.key = M.VARIANT_KEYS[Number(event.key) - 1];
  else if (event.key === "Home") next.gaze = M.GAZE[0];
  else if (event.key === "End") next.gaze = M.GAZE[1];
  else return;
  event.preventDefault();
  steer(next);
});
if (still.matches) touring = false;
describe();
draw();
`;

const css = `<style>
.iso{--ul-tissue:#f1ede7;--ul-skin:#d8c4b6;--ul-orb:#e6d0c8;--ul-muscle:#dfc5bf;--ul-smooth:#ead9d2;--ul-fat:#f2e7c6;--ul-lobe:#e6d6a8;--ul-tendon:#fcfcfa;--ul-tarsus:#e0e3e7;--ul-bone:#e9e6e0;--ul-grain:#cfcac0;--ul-sclera:#fcfcfb;--ul-humor:#f3f5f6;--ul-iris:#c6cacd;--ul-lens:#eef1f3;--ul-pupil:#3a3a3a;--ul-card:#fbfbf9;--ul-caruncle:#e9c9c4}
.iso[data-theme="dark"]{--ul-tissue:#1e1c1a;--ul-skin:#43362f;--ul-orb:#3a2b28;--ul-muscle:#3d2b28;--ul-smooth:#34292a;--ul-fat:#3a3320;--ul-lobe:#4a4128;--ul-tendon:#2e2e2e;--ul-tarsus:#262a2f;--ul-bone:#262522;--ul-grain:#3a3833;--ul-sclera:#1d1d1d;--ul-humor:#181b1c;--ul-iris:#33363a;--ul-lens:#22272a;--ul-pupil:#050505;--ul-card:#151515;--ul-caruncle:#4a3332}
.ul-tissue{fill:var(--ul-tissue)}.ul-bone{fill:var(--ul-bone)}.ul-grain{fill:var(--ul-grain)}
.ul-sclera{fill:var(--ul-sclera)}.ul-humor{fill:var(--ul-humor)}.ul-iris{fill:var(--ul-iris)}.ul-lens{fill:var(--ul-lens)}.ul-pupil{fill:var(--ul-pupil)}
.ul-muscle{fill:var(--ul-muscle)}.ul-smooth{fill:var(--ul-smooth)}.ul-fat{fill:var(--ul-fat)}.ul-lobe{fill:none;stroke:var(--ul-lobe);stroke-width:.5px;vector-effect:non-scaling-stroke}
.ul-tendon{fill:var(--ul-tendon)}.ul-tarsus{fill:var(--ul-tarsus)}.ul-card{fill:var(--ul-card)}.ul-caruncle{fill:var(--ul-caruncle)}
.ul-orbicularis{fill:none;stroke:var(--ul-orb);stroke-linejoin:round;stroke-linecap:round}
.ul-skin{fill:none;stroke:var(--ul-skin);stroke-linejoin:round;stroke-linecap:round}
.ul-conj{fill:none;stroke:var(--anatomy-mid);stroke-width:.7px;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.ul-lash{fill:none;stroke:var(--anatomy-mid);stroke-width:.55px;vector-effect:non-scaling-stroke;stroke-linecap:round}
.ul-dot{fill:var(--anatomy-mid)}.ul-reflex{fill:var(--anatomy-lit)}
.ul-rule{fill:var(--anatomy-top)}
.ul-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.iso-stage{touch-action:pan-y}
.iso-stage:focus{outline:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:520px){.iso-plate{overflow:hidden}.iso-stage svg{width:112%;margin:0 -6% -2%}}
</style>`;

const body =
  css +
  k.plateHtml({
    fig: "Fig 2",
    title: "상안검 · Upper eyelid",
    hint: "마우스 → 시선 · 1 2 3 변형",
    readout: `${first.variant.name} · 시선 0° · 거근 ${first.excursion.toFixed(1)} mm · MRD1 ${first.mrd1.toFixed(1)} mm`,
    keys: [
      { mark: "lit", label: "MRD1: 각막반사에서 윗눈꺼풀 테까지 (정면판)" },
      { mark: "raised", label: "거근 → 건막·뮐러근 → 검판: 눈꺼풀을 들어 올리는 사슬" },
      { mark: "edge", label: "안와격막: 건막과 만나는 높이가 쌍꺼풀과 홑꺼풀을 가름" },
      { mark: "dotted", label: "건막 앞 지방: 격막 뒤, 건막 앞" },
    ],
    caption: `왼쪽은 동공을 지나는 두께 8 mm의 시상 단면 표본(앞쪽이 오른쪽), 오른쪽은 같은 오른눈의 정면입니다. 앞에서 뒤로 피부 → 안륜근 → 안와격막과 건막 앞 지방 → 거근건막 → 뮐러근 → 검판(마이봄샘) → 결막 순서이고, 거근은 Whitnall 인대 아래에서 방향을 바꿔 앞으로 내려옵니다. 마우스를 좌우로 움직이면 시선이 −30°에서 +30°로 바뀌고, 거근이 수축해 눈꺼풀 테가 ${levatorFunction().toFixed(1)} mm 움직입니다(거근 기능, 정상 12–17 mm). 1·2·3 키로 쌍꺼풀(융합이 검판 위 약 3.7 mm), 홑꺼풀(융합이 낮아 지방이 검판 앞까지 내려옴), 건막성 안검하수(건막이 검판에서 떨어져 MRD1이 낮고 주름이 높지만 거근 기능은 정상)를 비교합니다. 검판 높이·Whitnall 위치·주름 높이와 연부조직 모양은 도식이며, 수치의 출처와 확인 상태는 해부 노트에 있습니다.`,
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="상안검 모형. 좌우 화살표로 시선을, 1 2 3 또는 위아래 화살표로 변형을 바꿉니다." aria-valuemin="${GAZE[0]}" aria-valuemax="${GAZE[1]}" aria-valuenow="0">${svg}<span class="ul-sr" role="status" aria-live="polite" data-status></span></div>`,
  });

const name = theme === "light" ? "upper-eyelid-light.html" : "upper-eyelid.html";
writeFileSync(join(HERE, name), k.pageHtml({ title: "상안검 해부", theme, body, script: kitScript() + live }).replace('<html lang="en">', '<html lang="ko">'));
console.log("wrote", name);
