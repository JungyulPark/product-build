// KStar Match — the product's own rules, ported 1:1 from the archived code
// (branch archive/kstarmatch-2026-01, commit 2526a60: kfortunes/js/saju.js and kfortunes/js/celebrities.js).
// Pure functions only: build.mjs uses them in Node, and the same text is inlined into the page.

export const STEMS = [
  { hanja: "甲", ko: "갑", element: "wood", yin: false },
  { hanja: "乙", ko: "을", element: "wood", yin: true },
  { hanja: "丙", ko: "병", element: "fire", yin: false },
  { hanja: "丁", ko: "정", element: "fire", yin: true },
  { hanja: "戊", ko: "무", element: "earth", yin: false },
  { hanja: "己", ko: "기", element: "earth", yin: true },
  { hanja: "庚", ko: "경", element: "metal", yin: false },
  { hanja: "辛", ko: "신", element: "metal", yin: true },
  { hanja: "壬", ko: "임", element: "water", yin: false },
  { hanja: "癸", ko: "계", element: "water", yin: true },
];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const mod = (value, n) => ((value % n) + n) % n;

// saju.js calculateYearPillar: the calendar year, not the solar year (no 立春 boundary).
export const yearPillar = (year) => [mod(year - 4, 10), mod(year - 4, 12)];

// saju.js calculateMonthPillar: the calendar month, not the 24 solar terms.
export const monthPillar = (year, month) => [mod((mod(year - 4, 10) % 5) * 2 + month - 1, 10), mod(month + 1, 12)];

// saju.js calculateDayPillar: days since 1900-01-31, which the code takes for a 甲子 day.
// It was really a 甲辰 day (JDN 2415051), so the stem is right and the branch is always 4 off.
// The original subtracts local Date objects; in Asia/Seoul (LMT +8:28 in 1900, +9:00 now) and in
// summer-time zones the difference falls a few minutes short of whole days and floors to the day
// before. UTC here is the arithmetic the code intends (and what it gives in UTC or Asia/Tokyo).
export const dayPillar = (year, month, day) => {
  const days = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000);
  return [mod(days, 10), mod(days, 12)];
};

// celebrities.js getYearBranch: (year - 1900) % 12, 1900 being the Rat. Same index as the year pillar's branch.
export const yearBranch = (year) => mod(year - 1900, 12);

// celebrities.js calculateTwinScore, without its random part.
// star = [stem, birthYear, popularity, korean, yin, category]
export function twinBase(user, star) {
  const [stem, birthYear, popularity, , yin] = star;
  let score = 0;
  if (stem === user.stem) score += 40;
  else if (STEMS[stem].element === STEMS[user.stem].element) score += 20;
  const a = user.branch;
  const b = yearBranch(birthYear);
  if (a === b) score += 15;
  else if (a % 4 === b % 4) score += 8; // 삼합: 子辰申, 丑巳酉, 寅午戌, 卯未亥
  if (!!yin === STEMS[user.stem].yin) score += 10;
  score += Math.floor((popularity || 80) / 20);
  return score;
}

// The random part: score + floor(random * 10), then clamped to 25..98.
export const JITTER = 9;
export const clampScore = (score) => Math.max(25, Math.min(98, score));

// celebrities.js MATCH_GRADES
export const GRADES = [
  { min: 85, ko: "운명적 쌍둥이", en: "Destiny Twin" },
  { min: 70, ko: "영혼의 짝", en: "Soul Match" },
  { min: 55, ko: "같은 기운", en: "Same Energy" },
  { min: 40, ko: "비슷한 에너지", en: "Similar Vibe" },
  { min: 0, ko: "다른 길", en: "Different Path" },
];
export const gradeOf = (score) => GRADES.find((grade) => score >= grade.min);

// One reading for a birthday: the eight characters, the drawer the day stem opens, and
// the twin score range. findBestTwin sorts Korean stars first, then by score; an exact
// day stem (40 + 10) always beats every other drawer, so the twin comes from this drawer.
export function readingOf(year, month, day, stars) {
  const pillars = { year: yearPillar(year), month: monthPillar(year, month), day: dayPillar(year, month, day) };
  const user = { stem: pillars.day[0], branch: pillars.year[1] };
  const drawer = stars.filter((star) => star[0] === user.stem);
  const korean = drawer.filter((star) => star[3]);
  const pool = korean.length ? korean : drawer;
  const bases = pool.map((star) => twinBase(user, star));
  const best = Math.max(...bases);
  return { pillars, stem: user.stem, branch: user.branch, cards: drawer.length, korean: korean.length, bases, low: clampScore(best), high: clampScore(best + JITTER) };
}

// One page load: every star gets its own floor(random * 10), the twin is the highest.
export const rollTwin = (reading, random = Math.random) => Math.max(...reading.bases.map((base) => clampScore(base + Math.floor(random() * 10))));
