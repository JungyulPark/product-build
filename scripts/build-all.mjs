// Build every figure (dark and light) and the gallery page.
// node scripts/build-all.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k } from "./kit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const figures = JSON.parse(readFileSync(join(ROOT, "figures.json"), "utf8"));
const only = process.argv.slice(2);

for (const figure of figures) {
  if (only.length && !only.includes(figure.slug)) continue;
  const build = join(ROOT, "figures", figure.slug, "build.mjs");
  if (!existsSync(build)) {
    console.log("skip", figure.slug, "(no build.mjs yet)");
    continue;
  }
  for (const flags of [[], ["--light"]]) execFileSync(process.execPath, [build, ...flags], { stdio: "inherit" });
}

const escape = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const card = (figure) => {
  const base = `figures/${figure.slug}/${figure.slug}`;
  const drawn = existsSync(join(ROOT, `${base}-light.html`));
  const cover = existsSync(join(ROOT, "figures", figure.slug, "cover.png"));
  return `<article class="g-item">
  ${cover ? `<a href="${base}-light.html"><img src="figures/${figure.slug}/cover.png" alt="${escape(figure.name)} 해부 그림" loading="lazy"></a>` : `<div class="g-empty">준비 중</div>`}
  <h2>${escape(figure.name)} <span class="g-en">${escape(figure.en || "")}</span></h2>
  <p>${escape(figure.idea || "")}</p>
  <p class="g-object">${escape(figure.structures || "")}</p>
  ${drawn ? `<p class="g-links"><a href="${base}-light.html">라이트</a> · <a href="${base}.html">다크</a> · <a href="figures/${figure.slug}/README.md">해부 노트</a></p>` : ""}
</article>`;
};

const body = `<header class="g-head"><h1>눈 주변 해부 · Periocular Anatomy</h1><p>안검·눈물길·안와·외안근을 받침대 위의 정밀 해부 모형으로 그립니다. 치수와 움직임은 출처가 있는 해부학 수치에서 나옵니다.</p></header>
<section class="g-grid">${figures.map(card).join("\n")}</section>`;
const css = `<style>
.g-head h1{margin:0 0 8px;font-size:22px;color:var(--anatomy-strong);font-weight:600;letter-spacing:-.01em}
.g-head p{margin:0 0 32px}
.g-grid{display:grid;gap:28px}
.g-item img{width:100%;height:auto;border-radius:12px;display:block;box-shadow:var(--anatomy-lift)}
.g-item h2{margin:14px 0 4px;font-size:16px;color:var(--anatomy-strong);font-weight:600}
.g-en{font-weight:400;color:var(--anatomy-muted);font-size:13px}
.g-item p{margin:0 0 4px}
.g-object{color:var(--anatomy-muted)}
.g-links a{color:var(--anatomy-strong)}
.g-empty{padding:48px;text-align:center;border:1px dashed var(--anatomy-muted);border-radius:12px;color:var(--anatomy-muted)}
</style>`;
writeFileSync(join(ROOT, "index.html"), k.pageHtml({ title: "Periocular Anatomy", theme: "light", body: css + body, width: 760 }).replace('<html lang="en">', '<html lang="ko">'));
console.log("wrote index.html");
