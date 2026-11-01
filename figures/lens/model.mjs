// 수정체(crystalline lens): 나이와 조절에 따른 모양, 굴절력, 모양체 고리, 섬모소대.
// 단위는 mm와 D. 순수 함수만 — build.mjs가 Node에서 쓰고, 같은 글이 페이지에 인라인됩니다.
// 출처 표기: [확인] 문헌 수치를 확인함 · [확인 필요] 기억값이나 가정, 원문 대조 전 · [도식] 그림을 위한 단순화.

export const AGE_RANGE = [10, 70];
export const DEMAND_MAX = 8; // 그림에서 다루는 근거리 요구량 (12.5 cm)

// 조절력(amplitude of accommodation), 평균. Hofstetter: 18.5 − 0.30 × 나이 [확인]
export const amplitudeOf = (age) => Math.max(0, 18.5 - 0.3 * age);
// 실제로 일어나는 조절 = 요구와 조절력 중 작은 것 [도식]
export const responseOf = (age, demand) => Math.min(demand, amplitudeOf(age));

// 수정체 모양.
// 전면 곡률반경 12.9 − 0.057 × 나이 (Dubbelman, 비조절) [확인]; 조절 A(D)에서 1/R = 1/R₀ + 0.0067 × A [확인]
// 후면 곡률반경 6.2 − 0.012 × 나이 (Dubbelman 2001) [확인]; 조절 항 0.0040 × A [확인 필요]
//   (Dubbelman 2005의 약 −0.13 mm/D를 1/R로 환산한 값. 이 값이면 굴절력 변화가 조절량과 거의 같아짐)
// 두께 2.93 + 0.0236 × 나이 [확인 필요: 기울기는 피질 12 + 8 µm/년, 핵 3 µm/년의 합과 일치] + 0.064 × A (Richdale 2013) [확인]
// 등가 굴절률 1.441 − 0.00039 × 나이 (Dubbelman 2001) [확인 필요]
// 적도 지름: 두 구면의 교차로 구한 비조절 지름에서 조절 1 D마다 0.05 mm 줄어듦 [확인 필요: MRI 약 0.3–0.4 mm/최대조절]
export function lensOf(age, A) {
  const Ra0 = 12.9 - 0.057 * age;
  const Rp0 = 6.2 - 0.012 * age;
  const Ra = 1 / (1 / Ra0 + 0.0067 * A);
  const Rp = 1 / (1 / Rp0 + 0.004 * A);
  const T = 2.93 + 0.0236 * age + 0.064 * A;
  const n = 1.441 - 0.00039 * age;
  const P1 = ((n - 1.336) * 1000) / Ra;
  const P2 = ((n - 1.336) * 1000) / Rp;
  const power = P1 + P2 - (T / 1000 / n) * P1 * P2;
  const relaxed = A ? lensOf(age, 0) : null;
  const meet = equatorOf(Ra, Rp, T);
  const radius = relaxed ? relaxed.radius - 0.025 * A : meet.r;
  return { age, A, Ra, Rp, T, n, power, radius, meet, scale: radius / meet.r };
}

// 두 구면(전면 Ra, 후면 Rp)이 두께 T만큼 떨어져 만나는 반지름과 그 위치(전극에서 s).
function equatorOf(Ra, Rp, T) {
  const sagA = (r) => Ra - Math.sqrt(Ra * Ra - r * r);
  const sagP = (r) => Rp - Math.sqrt(Rp * Rp - r * r);
  let low = 0;
  let high = Math.min(Ra, Rp) * 0.999;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (sagA(mid) + sagP(mid) < T) low = mid;
    else high = mid;
  }
  return { r: low, s: sagA(low) };
}

// 전극(s = 0)에서 후극(s = T)까지 축을 따라간 반지름. 두 구면 중 작은 쪽을 0.5 mm 폭으로 부드럽게 이어 적도를 둥글게 [도식].
export function radiusAt(lens, s) {
  const { Ra, Rp, T, scale } = lens;
  if (s <= 0 || s >= T) return 0;
  const a = Math.sqrt(Math.max(0, Ra * Ra - (Ra - s) * (Ra - s)));
  const b = Math.sqrt(Math.max(0, Rp * Rp - (Rp - (T - s)) * (Rp - (T - s))));
  const k = 0.5;
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(0, Math.min(a, b) - (h * h * k) / 4) * scale;
}
export const slopeAt = (lens, s) => Math.max(-60, Math.min(60, (radiusAt(lens, s + 1e-3) - radiusAt(lens, s - 1e-3)) / 2e-3));

// 축을 따라 촘촘한(극 쪽으로 더 촘촘한) 단면 점 [s, r].
export function profileOf(lens, count = 56) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    const s = (lens.T * (1 - Math.cos((Math.PI * i) / count))) / 2;
    points.push([s, radiusAt(lens, s)]);
  }
  return points;
}
// 적도: 반지름이 가장 큰 곳.
export function equatorAt(lens) {
  let best = [0, 0];
  for (let i = 0; i <= 400; i++) {
    const s = (lens.T * i) / 400;
    const r = radiusAt(lens, s);
    if (r > best[1]) best = [s, r];
  }
  return { s: best[0], r: best[1] };
}

// 모양체 고리(ciliary ring). 근육이 수축하면 안쪽 꼭짓점이 안으로 들어와 고리 지름이 최대 0.64 mm 줄어듦 (Strenk 2006, 나이와 무관) [확인].
// 수축 정도 = 근거리 요구 / 8 D [확인 필요: Strenk의 자극량 가정]. 바깥(공막 쪽)은 그대로.
// 비조절 때 수정체 적도와의 틈(circumlental space) 0.8 mm [확인 필요], 고리 두께와 축 방향 폭 [도식].
export const CIRCUMLENTAL = 0.8;
export const effortOf = (demand) => Math.min(1, demand / DEMAND_MAX);
export function ciliaryRingOf(age, demand) {
  const relaxed = lensOf(age, 0);
  const outer = relaxed.radius + CIRCUMLENTAL + 1.3;
  const inner = relaxed.radius + CIRCUMLENTAL - 0.32 * effortOf(demand);
  return { inner, outer };
}

// 섬모소대(zonule): 적도 뒤에 있는 고리 안쪽에서 수정체 앞면·적도·뒷면으로. 앞면에 붙는 섬유는 고리 뒤쪽에서, 뒷면에 붙는 섬유는 고리 앞쪽에서 나와 서로 엇갈림 [도식].
// 느슨함: 근육이 수축한 만큼 장력이 풀린다(Helmholtz) — 처짐 0.3 mm × 수축 정도로 표시 [도식].
// 노안에서도 근육은 똑같이 수축하므로 소대는 똑같이 느슨해지지만, 굳은 수정체는 거의 둥글어지지 않음.
export const SLACK = 0.3;
export function zonulesOf(age, demand) {
  const make = (lens, ring) => {
    const eq = equatorAt(lens);
    const r1 = eq.r - 0.75;
    const r2 = eq.r - 0.6;
    const front = Math.max(0, lens.Ra - Math.sqrt(Math.max(0, lens.Ra * lens.Ra - (r1 / lens.scale) ** 2)));
    const back = lens.T - Math.max(0, lens.Rp - Math.sqrt(Math.max(0, lens.Rp * lens.Rp - (r2 / lens.scale) ** 2)));
    return [
      { kind: "anterior", from: [eq.s + 1.35, ring.inner], to: [front, r1] },
      { kind: "equatorial", from: [eq.s + 0.75, ring.inner], to: [eq.s, eq.r] },
      { kind: "posterior", from: [eq.s + 0.25, ring.inner], to: [back, r2] },
    ];
  };
  const lens = lensOf(age, responseOf(age, demand));
  return make(lens, ciliaryRingOf(age, demand)).map((fiber) => ({ ...fiber, sag: SLACK * effortOf(demand) }));
}

// 단면판의 층 [도식]: 피질 바깥에서 성인핵, 태아핵, 배아핵 순서로, 수정체 모양을 중심 기준으로 줄인 것.
// 실제 경계는 개인차가 크고 세극등에서 보이는 띠(zone of discontinuity)로 나뉨. 두께 비율은 [확인 필요].
export const LAYERS = [
  { name: "성인핵", axial: 0.74, radial: 0.72 },
  { name: "태아핵", axial: 0.5, radial: 0.46 },
  { name: "배아핵", axial: 0.22, radial: 0.2 },
];

// 한 장면: 나이와 근거리 요구로부터 그림이 쓰는 모든 값.
export function sceneOf(age, demand) {
  const A = responseOf(age, demand);
  const lens = lensOf(age, A);
  return { age, demand, A, amplitude: amplitudeOf(age), effort: effortOf(demand), lens, eq: equatorAt(lens), ring: ciliaryRingOf(age, demand), zonules: zonulesOf(age, demand) };
}
