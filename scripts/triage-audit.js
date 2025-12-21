#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/triage-audit.js <audit.json> [--output triage.json]');
  process.exit(2);
}
const inputPath = args[0];
const outIndex = args.indexOf('--output');
const outPath = outIndex !== -1 && args[outIndex+1] ? args[outIndex+1] : 'triage.json';

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function normalizeNpmAudit(json) {
  // npm v7+ format has `vulnerabilities` map. Older npm has `advisories`.
  const issues = [];
  if (json.vulnerabilities) {
    for (const [module, v] of Object.entries(json.vulnerabilities)) {
      const severity = (v.severity || '').toLowerCase();
      issues.push({
        module_name: module,
        severity,
        title: v.title || (Array.isArray(v.via) && v.via[0] && v.via[0].title) || '',
        via: v.via || [],
        vulnerable_versions: v.range || v.vulnerable_versions || '',
        fix_available: !!(v.fix && (v.fix.target || v.fix.name)),
        fix: v.fix || null,
      });
    }
  } else if (json.advisories) {
    for (const id of Object.keys(json.advisories)) {
      const adv = json.advisories[id];
      issues.push({
        module_name: adv.module_name,
        severity: (adv.severity || '').toLowerCase(),
        title: adv.title || adv.overview || '',
        via: [adv],
        vulnerable_versions: adv.vulnerable_versions,
        fix_available: !!(adv.fix && adv.fix.name),
        fix: adv.fix || null,
      });
    }
  } else if (json.metadata && json.metadata.vulnerabilities) {
    // Some other formats
    for (const [sev, count] of Object.entries(json.metadata.vulnerabilities)) {
      // insufficient info; skip
    }
  }
  return issues;
}

try {
  const audit = loadJSON(inputPath);
  const issues = normalizeNpmAudit(audit);
  const high = issues.filter(i => i.severity === 'high');
  const critical = issues.filter(i => i.severity === 'critical');

  const result = {
    total: issues.length,
    high: high.length,
    critical: critical.length,
    issues: issues,
  };

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Wrote triage summary to ${outPath} (total=${result.total}, high=${result.high}, critical=${result.critical})`);
  process.exit(0);
} catch (err) {
  console.error('Failed to triage audit:', err.message);
  process.exit(1);
}
