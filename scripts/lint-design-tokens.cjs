#!/usr/bin/env node
/* eslint-disable */
/**
 * lint-design-tokens.js
 *
 * Scans src/**\/*.{ts,tsx} and warns when components drift away from the
 * "wallet recipe" design system:
 *   - Hard-coded hex / rgb / rgba colors in code (not in index.css / tailwind.config.ts)
 *   - Raw Tailwind color classes (text-white, bg-black, text-red-500, ...) — must use semantic tokens
 *   - Hero cards using thin `border` instead of `border-2`
 *   - Raw `shadow-lg|xl|2xl` instead of `shadow-wf*`
 *
 * Usage:
 *   node scripts/lint-design-tokens.js           # warn-only (exit 0)
 *   node scripts/lint-design-tokens.js --strict  # exit 1 on any finding
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const STRICT = process.argv.includes("--strict");

// Files / dirs to skip (config, generated, vendored).
const SKIP = [
  "src/integrations/supabase/types.ts",
  "src/integrations/supabase/client.ts",
  "src/index.css",
  "src/components/ui/", // shadcn primitives — opt out
  "src/test/",
];

// Tailwind raw color palette names (anything followed by -[shade] is suspect).
const RAW_PALETTE = [
  "slate","gray","zinc","neutral","stone","red","orange","amber","yellow",
  "lime","green","emerald","teal","cyan","sky","blue","indigo","violet",
  "purple","fuchsia","pink","rose",
];
const PALETTE_RE = new RegExp(
  `\\b(?:text|bg|border|ring|from|to|via|fill|stroke|outline|divide|shadow|placeholder|caret|accent)-(?:${RAW_PALETTE.join("|")})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
  "g"
);

const RAW_BW_RE = /\b(?:text|bg|border|ring|fill|stroke)-(?:white|black)\b/g;
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_RE = /\brgba?\s*\(/g;
const RAW_SHADOW_RE = /\bshadow-(?:lg|xl|2xl)\b/g;
// Hero card heuristic: className with `rounded-3xl` AND `border ` (1px) but NOT `border-2`.
// We scan single-line className strings.
const HERO_BORDER_RE = /className=(?:"|`|')([^"'`\n]*rounded-3xl[^"'`\n]*)(?:"|`|')/g;

/** @type {{file:string,line:number,rule:string,msg:string,snippet:string}[]} */
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    const rel = path.relative(ROOT, p).replaceAll("\\", "/");
    if (SKIP.some((s) => rel.startsWith(s) || rel === s)) continue;
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) scan(p, rel);
  }
}

function pushIf(rel, lineNo, line, re, rule, msg, allow) {
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(line)) !== null) {
    if (allow && allow(m, line)) continue;
    findings.push({ file: rel, line: lineNo, rule, msg, snippet: line.trim().slice(0, 160) });
  }
}

function scan(abs, rel) {
  const src = fs.readFileSync(abs, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    const lineNo = i + 1;
    // 1. raw palette colors
    pushIf(rel, lineNo, line, PALETTE_RE, "raw-tailwind-color",
      "Raw Tailwind palette color — use semantic token (text-ink, bg-success/10, etc.).");
    // 2. text-white/bg-black — allowed only on gradient lines
    pushIf(rel, lineNo, line, RAW_BW_RE, "raw-bw",
      "Use semantic token (text-ink-on-primary / bg-app-canvas). `text-white` is only allowed on `bg-gradient-aero`/`bg-gradient-button` rows.",
      (m) => {
        if (m[0] === "text-white" && /bg-gradient-(aero|button|primary)/.test(line)) return true;
        return false;
      });
    // 3. hex colors in source (skip CSS files; allow in comments/JSDoc-ish lines that are pure comments)
    if (!/^\s*\*/.test(line) && !/^\s*\/\//.test(line)) {
      pushIf(rel, lineNo, line, HEX_RE, "hex-literal",
        "Hard-coded hex color — move into index.css as a token and reference via hsl(var(--token)).");
    }
    // 4. rgb()/rgba() literals in source
    pushIf(rel, lineNo, line, RGB_RE, "rgb-literal",
      "rgb()/rgba() literal — use hsl(var(--token) / <alpha>) from index.css instead.");
    // 5. raw shadow utilities
    pushIf(rel, lineNo, line, RAW_SHADOW_RE, "raw-shadow",
      "Use semantic `shadow-wf` / `shadow-wf-hover` / `shadow-wf-lg`, not raw Tailwind shadows.");
    // 6. hero card thin border
    let m;
    HERO_BORDER_RE.lastIndex = 0;
    while ((m = HERO_BORDER_RE.exec(line)) !== null) {
      const cls = m[1];
      if (/\bborder-2\b/.test(cls)) continue;
      if (/\bborder(?:-[trblxy])?(?:\s|$|-hairline)/.test(cls) || /\bborder\b/.test(cls)) {
        findings.push({
          file: rel, line: lineNo, rule: "thin-hero-border",
          msg: "Hero card (rounded-3xl) should use `border-2` for crispness.",
          snippet: line.trim().slice(0, 160),
        });
      }
    }
  });
}

walk(SRC);

if (findings.length === 0) {
  console.log("✓ lint-design-tokens: 0 findings");
  process.exit(0);
}

const byFile = findings.reduce((acc, f) => {
  (acc[f.file] ||= []).push(f);
  return acc;
}, {});

const RULE_ICON = {
  "raw-tailwind-color": "🎨",
  "raw-bw": "⚫",
  "hex-literal": "#",
  "rgb-literal": "()",
  "raw-shadow": "▦",
  "thin-hero-border": "▭",
};

console.log(`\nlint-design-tokens: ${findings.length} finding(s) across ${Object.keys(byFile).length} file(s)\n`);
for (const file of Object.keys(byFile).sort()) {
  console.log(`  ${file}`);
  for (const f of byFile[file]) {
    const icon = RULE_ICON[f.rule] || "•";
    console.log(`    ${icon}  L${f.line}  [${f.rule}]  ${f.msg}`);
    console.log(`        > ${f.snippet}`);
  }
  console.log("");
}

const byRule = findings.reduce((acc, f) => ((acc[f.rule] = (acc[f.rule] || 0) + 1), acc), {});
console.log("Summary:");
for (const [rule, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}  ${rule}`);
}
console.log("");

if (STRICT) {
  console.error("✗ lint-design-tokens: strict mode — failing build");
  process.exit(1);
}
console.log("(warn-only mode — pass --strict to fail CI)");
process.exit(0);