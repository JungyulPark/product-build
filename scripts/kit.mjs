// One import point for the vendored Anatomy skill (.claude/skills/anatomy), so figure builds
// don't depend on its folder layout.
export * as k from "../.claude/skills/anatomy/kit/iso-kit.mjs";
export { kitScript } from "../.claude/skills/anatomy/scripts/inline-kit.mjs";

import { readFileSync } from "node:fs";

// A figure's own model module as page script: the same text Node imports, with `export` stripped.
export const moduleScript = (url) => readFileSync(url, "utf8").replace(/^export /gm, "");
