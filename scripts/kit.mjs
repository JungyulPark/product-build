// One import point for the vendored Anatomy skill (.claude/skills/anatomy), so figure builds
// don't depend on its folder layout.
export * as k from "../.claude/skills/anatomy/kit/iso-kit.mjs";
export { kitScript } from "../.claude/skills/anatomy/scripts/inline-kit.mjs";

import { readFileSync } from "node:fs";

// A figure's own model module as page script: the same text Node imports, with `export` stripped.
export const moduleScript = (url) => readFileSync(url, "utf8").replace(/^export /gm, "");

// kit/lathe.mjs as page script, wrapped as `G` so its helpers don't collide with the inlined kit
// (both declare signedArea, oriented, runsOf). It uses cameraOf, iso and pathOf from kitScript().
export * as G from "../.claude/skills/anatomy/kit/lathe.mjs";
export function latheScript() {
  const source = readFileSync(new URL("../.claude/skills/anatomy/kit/lathe.mjs", import.meta.url), "utf8");
  const names = [...source.matchAll(/^export (?:function|const) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  const body = source.replace(/^import .*$/gm, "").replace(/^export /gm, "");
  return `const G = (() => {\n${body}\nreturn { ${names.join(", ")} };\n})();\n`;
}
