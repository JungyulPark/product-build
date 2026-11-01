// 상안검(upper eyelid): 시선에 따라 움직이는 눈꺼풀의 시상 단면과 정면 측정값.
// 단위 mm, 각도는 도(°). 단면 좌표 (a, v): 안구 중심이 원점, a는 앞(+), v는 위(+).
// 표시: [확인] 문헌 수치 확인 · [확인 필요] 원문 대조 전 · [도식] 그림을 위한 단순화.

const RAD = Math.PI / 180;

// ---- 안구 ----
export const GLOBE_R = 12; // 공막 반지름 (안축장 약 24 mm) [확인 필요: 평균값]
export const CORNEA_R = 7.8; // 각막 앞면 곡률반경 [확인 필요: 평균값]
export const LIMBUS_V = 5.3; // 각막 세로 반지름 (세로 지름 약 10.6 mm) [확인 필요]
const CORNEA_C = Math.sqrt(GLOBE_R ** 2 - LIMBUS_V ** 2) - Math.sqrt(CORNEA_R ** 2 - LIMBUS_V ** 2); // 각막 곡률 중심의 a
export const APEX = CORNEA_C + CORNEA_R; // 각막 정점까지 거리
const LIMBUS_ANGLE = Math.atan2(LIMBUS_V, Math.sqrt(GLOBE_R ** 2 - LIMBUS_V ** 2));

// 안구 중심에서 시축과 δ(rad) 각도로 나간 방향의 안구 표면 거리: 각막 안에서는 각막 구면, 밖에서는 공막.
export function eyeRadius(delta) {
  const d = Math.abs(delta);
  if (d >= LIMBUS_ANGLE) return GLOBE_R;
  return CORNEA_C * Math.cos(d) + Math.sqrt(CORNEA_R ** 2 - (CORNEA_C * Math.sin(d)) ** 2);
}

// ---- 변형 ----
// 쌍꺼풀: 격막–건막 융합이 검판 위 약 3.7 mm(서양인 사체) [확인], 건막 섬유가 피부에 붙어 주름 [확인: 정성적].
// 홑꺼풀: 융합이 낮아(검판 앞면) 지방이 아래로 내려오고 주름이 없음 [확인: 정성적], 높이는 [확인 필요].
// 건막성 안검하수: 건막이 검판에서 떨어져 늘어남 — MRD1 낮음, 거근 기능 정상, 주름 높음 [확인: 정성적], 수치는 [도식].
export const VARIANTS = {
  double: { name: "쌍꺼풀", mrd1: 4.5, fusion: 3.7, crease: 7, fold: true, dehiscence: 0 },
  single: { name: "홑꺼풀", mrd1: 4.5, fusion: -6, crease: 0, fold: false, dehiscence: 0 },
  aponeurotic: { name: "건막성 안검하수", mrd1: 1.5, fusion: 3.7, crease: 10.5, fold: true, dehiscence: 4 },
};
export const VARIANT_KEYS = Object.keys(VARIANTS);

// ---- 고정 수치 ----
export const TARSUS = 9.5; // 상검판 높이 [확인 필요: 교과서 8–12 mm, 동양인 더 낮음]
export const LOWER_TARSUS = 4; // 하검판 높이 [확인 필요]
export const MULLER = 12; // 거근이 건막과 뮐러근으로 갈라지는 높이: 검판 위 10–12 mm [확인], 뮐러근 높이 약 13.7 mm [확인]
export const MRD2 = 5.5; // [확인 필요: 정상 5–5.5 mm]
export const GAZE = [-30, 30]; // 그림이 다루는 시선 범위
export const WHITNALL = [-3.5, 18.6]; // Whitnall 인대 단면 위치: 정면 주시에서 검판 위 테두리로부터 건막 경로로 약 14 mm [확인 필요: 교과서 14–20 mm], 안와 천장 아래 [도식]
export const ARCUS = [9.6, 19.2]; // 격막이 시작하는 안와테두리(arcus marginalis) [도식]
const LID_R = 12.7; // 눈꺼풀이 미끄러지는 평균 반지름

// 정면 주시에서 윗눈꺼풀 테(앞쪽 모서리, 피부 쪽 2.3 mm)가 각막반사 위 mrd1 mm에 오는 각도.
function marginAngle(mrd1) {
  let low = 0;
  let high = 1.2;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const v = (eyeRadius(mid) + 2.3) * Math.sin(mid) - 0.35;
    if (v < mrd1) low = mid;
    else high = mid;
  }
  return low;
}

// 거근 기능(levator function): 최대 하방 주시에서 상방 주시까지 눈꺼풀 테가 움직인 거리.
// 여기서는 테가 시선을 따라 안구 위를 미끄러지므로 호의 길이 = LID_R × Δ시선. ±30°에서 13.3 mm (정상 12–17 mm [확인]).
export const excursionOf = (gaze) => LID_R * (gaze - GAZE[0]) * RAD;
export const levatorFunction = () => excursionOf(GAZE[1]);

// ---- 기하 도구 ----
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const mul = (p, k) => [p[0] * k, p[1] * k];
const len = (p) => Math.hypot(p[0], p[1]);
const unit = (p) => mul(p, 1 / (len(p) || 1));
const polar = (angle, r) => [r * Math.cos(angle), r * Math.sin(angle)];
const bezier = (p0, p1, p2, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n;
  return add(add(mul(p0, (1 - t) ** 2), mul(p1, 2 * t * (1 - t))), mul(p2, t * t));
});
// Catmull-Rom을 촘촘한 점으로.
export function spline(points, per = 8) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
export function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += len(sub(points[i], points[i - 1]));
  return total;
}
// 폴리라인에서 호의 길이 s인 점과 접선.
export function along(points, s) {
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const step = len(sub(points[i], points[i - 1]));
    if (walked + step >= s || i === points.length - 1) {
      const t = step ? Math.max(0, Math.min(1, (s - walked) / step)) : 0;
      return { at: add(points[i - 1], mul(sub(points[i], points[i - 1]), t)), tangent: unit(sub(points[i], points[i - 1])) };
    }
    walked += step;
  }
  return { at: points[0], tangent: [1, 0] };
}
// s0..s1 구간의 부분 폴리라인.
export function slice(points, s0, s1) {
  const out = [along(points, s0).at];
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    walked += len(sub(points[i], points[i - 1]));
    if (walked > s0 && walked < s1) out.push(points[i]);
  }
  out.push(along(points, s1).at);
  return out;
}
// 고른 간격(step mm)으로 다시 찍기.
export function resample(points, step = 0.4) {
  const total = pathLength(points);
  const count = Math.max(2, Math.ceil(total / step));
  return Array.from({ length: count + 1 }, (_, i) => along(points, (total * i) / count).at);
}
// 폴리라인을 왼쪽 법선 방향으로 d만큼(가변 d(t) 허용) 옮김.
export function offset(points, d) {
  const total = pathLength(points);
  let walked = 0;
  return points.map((p, i) => {
    if (i) walked += len(sub(p, points[i - 1]));
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const t = unit(sub(b, a));
    const amount = typeof d === "function" ? d(total ? walked / total : 0) : d;
    return add(p, mul([-t[1], t[0]], amount));
  });
}
const band = (centre, half) => [...offset(centre, half), ...offset(centre, typeof half === "function" ? (t) => -half(t) : -half).reverse()];

// ---- 한 장면 ----
export function lidOf(gaze, key = "double") {
  const variant = VARIANTS[key];
  const g = gaze * RAD;
  // 안구 위의 점: 시축과 φ(rad)인 방향, 표면에서 extra mm 바깥.
  const onEye = (phi, extra = 0) => polar(phi, eyeRadius(phi - g) + extra);
  const rot = (p) => [p[0] * Math.cos(g) - p[1] * Math.sin(g), p[0] * Math.sin(g) + p[1] * Math.cos(g)];

  // 윗눈꺼풀 테: 각막반사(각막 정점) 위 MRD1. 시선을 따라 안구와 함께 돌아감 [도식: 눈꺼풀–안구 동반 운동].
  const margin = g + marginAngle(variant.mrd1);
  const tarsusTop = margin + TARSUS / LID_R;
  const T = onEye(tarsusTop, 0.8); // 검판 위 테두리 (뮐러근이 붙는 곳)
  const insertAt = variant.dehiscence ? tarsusTop + variant.dehiscence / LID_R : margin + 3 / LID_R;
  const I = onEye(insertAt, variant.dehiscence ? 1.7 : 1.45); // 건막 부착점 (정상: 검판 앞면 아래 1/3, 하수: 검판 위로 떨어짐)

  // 거근 복합체의 길: 검판 앞면 → 검판 위 테두리 → Whitnall 아래 → 뒤쪽(안와 첨부 방향) [도식].
  const W = WHITNALL;
  const tangent = unit([-0.3, 1]);
  const toW = len(sub(W, T));
  const lower = [];
  for (let phi = insertAt; phi < tarsusTop; phi += 0.02) lower.push(onEye(phi, 1.45));
  const route = [...lower, ...bezier(onEye(tarsusTop, 1.45), [T[0] - 0.5, W[1]], [W[0], W[1] - 1.3], 20), [W[0] - 3, W[1] - 1.6], [-14, W[1] - 2.6], [-34, W[1] - 4.5]];
  // 건막 길이는 변형마다 정면 주시에서 근육–건막 이행부가 Whitnall 1 mm 뒤에 오도록 정함 [도식].
  const rest = lidRoute(variant, 0);
  const tendon = rest.toWhitnall + 1;
  const total = pathLength(route);
  const junction = Math.min(total - 2, tendon);
  const split = Math.max(1, junction - 2.5);

  // 뮐러근: 갈라지는 점에서 검판 위 테두리까지, 결막 쪽.
  const splitAt = along(route, split).at;
  const muller = bezier(splitAt, add(onEye(tarsusTop, 0.8), mul(tangent, 3)), onEye(tarsusTop, 0.8), 12).map((p, i, all) => add(p, mul(unit([1, 0.15]), -0.55 * Math.sin((Math.PI * i) / (all.length - 1)))));
  // 건막: 갈라지는 점에서 부착점까지, 앞쪽.
  const aponeurosis = slice(route, 0, split).reverse();
  // 거근 근복: 이행부부터 뒤로, 수축할수록 두꺼워짐.
  const contraction = (gaze - GAZE[0]) / (GAZE[1] - GAZE[0]);
  const muscle = resample(slice(route, split, total), 0.5);
  const belly = (t) => 0.35 + Math.min(1, t * 4) * (1.0 + 0.35 * contraction);

  // 격막과 융합점: 쌍꺼풀은 검판 위 테두리 위 fusion mm(건막 위), 홑꺼풀은 검판 앞면 아래쪽.
  const fusionS = variant.fusion >= 0 ? Math.max(0.5, pathLength(lower) + variant.fusion) : Math.max(0.3, pathLength(lower) + variant.fusion);
  const F = add(along(route, fusionS).at, [0.35, 0.1]);
  const septum = bezier(ARCUS, [(ARCUS[0] + F[0]) / 2 + 1.2, (ARCUS[1] + F[1]) / 2 + 0.3], F, 18);
  // 건막 앞 지방: 격막과 건막 사이, 융합점에서 위로 Whitnall 앞까지.
  const fatBack = slice(route, fusionS, Math.min(junction + 1, total - 1)).map((p) => add(p, [0.25, 0.25]));
  const fat = [...septum, ...fatBack.reverse(), [W[0] + 1.5, W[1] + 0.2], [ARCUS[0] - 3, ARCUS[1] + 0.4]];

  // 피부: 테 → 검판 앞 → 주름 → (쌍꺼풀이면 접힘) → 눈썹 [도식: 주름 높이만 변형 값].
  const lift = 0.5 + 0.5 * contraction; // 위를 볼수록 주름 위 피부가 더 많이 접힘
  const marginFront = onEye(margin, 2.3);
  const creaseAt = margin + Math.max(variant.crease, 6) / LID_R;
  const skin = [marginFront, onEye(margin + 1.5 / LID_R, 2.45), onEye(margin + 4 / LID_R, 2.5)];
  // 주름 위 피부(덮개)는 눈썹에 매달려 주름과 눈썹 사이에 놓임 — 위를 볼수록 더 접힘 [도식].
  const brow = [ARCUS[0] + 4.1, ARCUS[1] + 0.2];
  const lerp = (p, q, t) => add(p, mul(sub(q, p), t));
  if (variant.fold) {
    const C = onEye(creaseAt, 2.25);
    const out = unit(C);
    const up = [-out[1], out[0]];
    const tuck = add(add(C, mul(up, 0.55)), mul(out, -0.12));
    const edge = add(add(C, mul(out, 0.9 + 0.7 * lift)), [0, 0.35]);
    const hood = add(lerp(edge, brow, 0.45), [0.8 + 0.4 * lift, 0]);
    skin.push(C, tuck, edge, hood);
  } else {
    const C = onEye(creaseAt, 2.9 + 0.6 * lift);
    skin.push(C, add(lerp(C, brow, 0.45), [1.2 + 0.4 * lift, 0]));
  }
  skin.push(brow, [ARCUS[0] + 4.7, ARCUS[1] + 3.0], [ARCUS[0] + 4.2, 25.5]);
  const skinLine = spline(skin, 10);

  // 아래눈꺼풀: 시선의 0.4만큼 따라감 [도식].
  const lowerMargin = 0.4 * g - Math.asin(MRD2 / LID_R);
  const lowerFront = onEye(lowerMargin, 2.0);
  const lowerSkin = spline([[lowerFront[0] - 2.4, -12], onEye(lowerMargin - 5 / LID_R, 2.7), onEye(lowerMargin - 2 / LID_R, 2.3), lowerFront], 10);
  const lowerTarsus = [];
  for (let phi = lowerMargin - LOWER_TARSUS / LID_R; phi <= lowerMargin + 1e-6; phi += 0.02) lowerTarsus.push(onEye(phi, 0.75));

  // 검판(위): 안구 표면을 따라 테에서 위 테두리까지.
  const tarsus = [];
  for (let phi = margin; phi <= tarsusTop + 1e-6; phi += 0.02) tarsus.push(onEye(phi, 0.8));
  const meibom = tarsus.slice(0, Math.floor(tarsus.length * 0.85));

  // 결막: 테 뒤에서 검판 뒷면을 따라 위 원개(fornix)까지, 거기서 안구 쪽으로 꺾여 각막 가장자리까지.
  const fornix = tarsusTop + 9 / LID_R;
  const conjunctiva = [];
  for (let phi = margin; phi <= fornix; phi += 0.02) conjunctiva.push(onEye(phi, 0.18 + 0.5 * Math.max(0, (phi - tarsusTop) / (fornix - tarsusTop))));
  for (let phi = fornix; phi >= g + LIMBUS_ANGLE; phi -= 0.02) conjunctiva.push(onEye(phi, 0.05));

  // 상직근: 안구 위 부착부(각막 가장자리 뒤 7.7 mm [확인 필요: Tillaux 나선 평균])에서 뒤로 [도식].
  const srInsert = g + LIMBUS_ANGLE + 7.7 / GLOBE_R;
  const sr = [onEye(srInsert, 0.1)];
  for (let phi = srInsert + 0.08; phi <= Math.PI * 0.62; phi += 0.06) sr.push(onEye(phi, 0.1 + 1.3 * Math.min(1, (phi - srInsert) / 0.5)));
  sr.push([-14, 11.3]);

  // 속눈썹: 위는 앞·위로, 아래는 앞·아래로 휜 곡선 [도식: 길이 위 약 8, 아래 약 6 mm].
  const lashes = [0, 1, 2].map((i) => {
    const base = onEye(margin + 0.02 * (i - 1), 2.1 + 0.2 * i);
    const out = unit(base);
    const up = [-out[1], out[0]];
    return bezier(base, add(base, add(mul(out, 3.4), mul(up, -0.5 + 0.3 * i))), add(base, add(mul(out, 4.6 + 0.5 * i), mul(up, 2.6 + 0.4 * i))), 10);
  });
  const lowerLashes = [0, 1].map((i) => {
    const base = onEye(lowerMargin - 0.02 * i, 1.9 + 0.2 * i);
    const out = unit(base);
    const up = [-out[1], out[0]];
    return bezier(base, add(base, mul(out, 2.4)), add(base, add(mul(out, 3.4 + 0.4 * i), mul(up, -1.4 - 0.3 * i))), 10);
  });

  // 안구 내부(정면 주시 기준 모양을 시선만큼 회전): 홍채, 동공 4 mm, 수정체(30세, 수정체 그림 모형) [도식].
  const globe = [];
  for (let i = 0; i <= 180; i++) {
    const d = -Math.PI + (i / 180) * 2 * Math.PI;
    globe.push(onEye(g + d, 0));
  }
  const iris = [[APEX - 3.1, 2.0], [APEX - 2.75, 5.0], [APEX - 2.4, 5.3], [APEX - 2.95, 5.2], [APEX - 3.4, 2.0]].map(rot);
  const irisBelow = [[APEX - 3.1, -2.0], [APEX - 2.75, -5.0], [APEX - 2.4, -5.3], [APEX - 2.95, -5.2], [APEX - 3.4, -2.0]].map(rot);

  // 정면 측정값.
  const reflex = rot([APEX, 0]);
  const marginV = marginFront[1] - 0.35;
  const front = {
    reflex: [0, reflex[1]],
    upper: marginV,
    lower: lowerFront[1] + 0.3,
    crease: variant.crease ? marginV + variant.crease : null,
    fold: variant.fold ? marginV + variant.crease - 1.2 - 0.8 * lift : marginV + 1.2 + 0.6 * (1 - lift),
  };

  return {
    gaze, key, variant, g, contraction, excursion: excursionOf(gaze), mrd1: front.upper - front.reflex[1], mrd2: front.reflex[1] - front.lower, front,
    globe, iris, irisBelow, reflex, tarsus, meibom, lowerTarsus, conjunctiva, muller, aponeurosis, muscle, belly, septum, fat, F, I, T, skinLine, lowerSkin, lashes, lowerLashes, sr, marginFront, lowerFront,
    band,
  };
}

// 정면 주시에서 검판 위 테두리부터 Whitnall까지의 건막 경로 길이 (건막 길이를 정하는 데 씀).
function lidRoute(variant, gaze) {
  const g = gaze * RAD;
  const onEye = (phi, extra = 0) => polar(phi, eyeRadius(phi - g) + extra);
  const margin = g + marginAngle(variant.mrd1);
  const tarsusTop = margin + TARSUS / LID_R;
  const insertAt = variant.dehiscence ? tarsusTop + variant.dehiscence / LID_R : margin + 3 / LID_R;
  const T = onEye(tarsusTop, 0.8);
  const tangent = unit([-0.3, 1]);
  const toW = len(sub(WHITNALL, T));
  const lower = [];
  for (let phi = insertAt; phi < tarsusTop; phi += 0.02) lower.push(onEye(phi, 1.45));
  const route = [...lower, ...bezier(onEye(tarsusTop, 1.45), [T[0] - 0.5, WHITNALL[1]], [WHITNALL[0], WHITNALL[1] - 1.3], 20)];
  return { toWhitnall: pathLength(route) };
}
