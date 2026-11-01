// Build every product figure (dark and light) and the gallery page.
// node scripts/build-all.mjs [slug ...]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k } from "./kit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const products = JSON.parse(readFileSync(join(ROOT, "products.json"), "utf8"));
const only = process.argv.slice(2);

for (const product of products) {
  if (only.length && !only.includes(product.slug)) continue;
  const build = join(ROOT, "products", product.slug, "build.mjs");
  if (!existsSync(build)) {
    console.log("skip", product.slug, "(no build.mjs yet)");
    continue;
  }
  for (const flags of [[], ["--light"]]) execFileSync(process.execPath, [build, ...flags], { stdio: "inherit" });
}

const escape = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const card = (product) => {
  const base = `products/${product.slug}/${product.slug}`;
  const drawn = existsSync(join(ROOT, `${base}-light.html`));
  const cover = existsSync(join(ROOT, "products", product.slug, "cover.png"));
  return `<article class="g-item">
  ${cover ? `<a href="${base}-light.html"><img src="products/${product.slug}/cover.png" alt="${escape(product.name)} 아나토미 그림" loading="lazy"></a>` : `<div class="g-empty">아직 그리지 않음</div>`}
  <h2>${escape(product.name)}</h2>
  <p>${escape(product.summary)}</p>
  <p class="g-object">${escape(product.object || "")}</p>
  <p class="g-links">${drawn ? `<a href="${base}-light.html">라이트</a> · <a href="${base}.html">다크</a> · ` : ""}<a href="products/${product.slug}/README.md">해부 노트</a>${product.site ? ` · <a href="${escape(product.site)}">사이트</a>` : ""}</p>
</article>`;
};

const body = `<header class="g-head"><h1>Product Anatomy</h1><p>제품마다 하나의 실제 기계로 그린 해부도. 각 그림의 숫자와 움직임은 그 제품 코드에서 옮긴 모델이 그대로 만듭니다.</p></header>
<section class="g-grid">${products.map(card).join("\n")}</section>`;
const css = `<style>
.g-head h1{margin:0 0 8px;font-size:22px;color:var(--anatomy-strong);font-weight:600;letter-spacing:-.01em}
.g-head p{margin:0 0 32px}
.g-grid{display:grid;gap:28px}
.g-item img{width:100%;height:auto;border-radius:12px;display:block;box-shadow:var(--anatomy-lift)}
.g-item h2{margin:14px 0 4px;font-size:16px;color:var(--anatomy-strong);font-weight:600}
.g-item p{margin:0 0 4px}
.g-object{color:var(--anatomy-muted)}
.g-links a{color:var(--anatomy-strong)}
.g-empty{padding:64px;text-align:center;border:1px dashed var(--anatomy-muted);border-radius:12px;color:var(--anatomy-muted)}
</style>`;
writeFileSync(join(ROOT, "index.html"), k.pageHtml({ title: "Product Anatomy", theme: "light", body: css + body, width: 760 }).replace('<html lang="en">', '<html lang="ko">'));
console.log("wrote index.html");
