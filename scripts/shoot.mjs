// Screenshot a built figure with the preinstalled Playwright Chromium.
// node scripts/shoot.mjs page.html out.png [--width 1440] [--scale 2] [--wait 2500]
//   [--hover 0.6,0.5] [--keys ArrowRight,ArrowRight] [--times 1200,2400] [--zoom x,y,w,h] [--reduced]
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Playwright is resolved like require() does (NODE_PATH), so a global install works without a package.json.
const { chromium } = createRequire(import.meta.url)("playwright");

const [target, out = "shot.png", ...rest] = process.argv.slice(2);
if (!target) {
  console.error("usage: node scripts/shoot.mjs page.html out.png [options]");
  process.exit(1);
}
const opt = { width: 1440, height: 1100, scale: 2, wait: 2500 };
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, "").replace(/-(\w)/g, (_, c) => c.toUpperCase())] = rest[i + 1];
const list = (value) => (value ? String(value).split(",") : []);
const nums = (value) => list(value).map(Number);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(opt.width), height: Number(opt.height) },
  deviceScaleFactor: Number(opt.scale),
  reducedMotion: "reduced" in opt ? "reduce" : "no-preference",
});
const problems = [];
page.on("console", (message) => message.type() === "error" && problems.push("console: " + message.text()));
page.on("pageerror", (error) => problems.push("exception: " + error.message));
await page.goto(pathToFileURL(resolve(target)).href);
const plate = page.locator(".iso-plate").first();
await page.waitForTimeout(Number(opt.wait));
if (opt.hover) {
  const [fx, fy] = nums(opt.hover);
  const box = await plate.boundingBox();
  await page.mouse.move(box.x + box.width * fx, box.y + box.height * fy, { steps: 10 });
}
for (const key of list(opt.keys)) {
  await page.focus('[tabindex="0"]');
  await page.keyboard.press(key);
  await page.waitForTimeout(120);
}
const shoot = async (file) => {
  if (opt.zoom) {
    const [x, y, w, h] = nums(opt.zoom);
    const box = await plate.boundingBox();
    await page.screenshot({ path: file, clip: { x: box.x + x, y: box.y + y, width: w, height: h } }); // pair with --scale 4 for close-ups
  } else await plate.screenshot({ path: file });
  const readout = await page.locator("[data-readout]").first().textContent();
  console.log("shot", file, "·", readout);
};
if (opt.hover || opt.keys) await page.waitForTimeout(1600);
await shoot(out);
let previous = 0;
for (const at of nums(opt.times)) {
  await page.waitForTimeout(Math.max(0, at - previous));
  previous = at;
  await shoot(out.replace(/\.png$/, `-${at}.png`));
}
const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (scrolls) problems.push("page scrolls sideways");
console.log(problems.length ? problems.join("\n") : "no console errors");
await browser.close();
