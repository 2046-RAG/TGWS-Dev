#!/usr/bin/env node
// i18n-audit.mjs
// Scans src/**/*.tsx for hardcoded English text in JSX that should be internationalized.
// Outputs i18n-audit-report.json and exits with code 1 if any hardcoded text is found, 0 otherwise.
//
// Whitelist:
//   - Brand names (TechGuru, VMware, Proxmox, ...)
//   - Product names (Veeam, Fortinet, ...)
//   - Technical acronyms (API, CDN, SSL, ...)
//   - Single-word identifiers, CSS classes, URLs, file paths
//
// Inline ignore comments:
//   // i18n-audit-ignore-next-line
//   // i18n-audit-ignore-line
//   /* i18n-audit-skip-file */  (at top of file)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const MESSAGES_DIR = path.join(SRC_DIR, 'messages');
const REPORT_PATH = path.join(ROOT, 'i18n-audit-report.json');

// ───────────────────────────────────────────────────────────
// Whitelist: brand names, product names, technical terms
// ───────────────────────────────────────────────────────────
const WHITELIST = new Set([
  // Brand
  'TechGuru', 'TechGuru Network & Data Solutions', 'TGWS',
  // Pillars (treated as brand when standalone)
  'Build', 'Run', 'Protect',
  // Vendor / partner names
  'VMware', 'Proxmox', 'Sangfor', 'Nutanix', 'StarWind', 'H3C',
  'Veeam', 'Veritas', 'Cohesity', 'Huawei', 'Cisco', 'Dell', 'HP',
  'Lenovo', 'Sophos', 'Fortinet', 'Ruijie', 'Sundray', 'KVM',
  'Hillstone', 'Arcfra', 'Alibaba', 'ByteDance', 'Volcengine',
  'Bailian', 'Alibaba Cloud', 'Alibaba Cloud Bailian',
  'ByteDance Volcengine', 'Twitter', 'LinkedIn', 'WhatsApp',
  'Facebook', 'Microsoft', 'Edge', 'Chromium',
  // Technical acronyms / terms (short)
  'API', 'APIs', 'CDN', 'SSL', 'TLS', 'DNS', 'HTTP', 'HTTPS',
  'TCP', 'UDP', 'IP', 'VM', 'VMs', 'OS', 'IT', 'AI', 'AIGC',
  'HCI', 'NGFW', 'WAF', 'EDR', 'NDR', 'MDR', 'XDR', 'SD-WAN',
  'WiFi', 'WiFi 6', 'WiFi 7', 'SSID', 'VLAN', 'VPN', 'IOPS',
  'PaaS', 'IaaS', 'SaaS', 'REST', 'JSON', 'XML', 'HTML', 'CSS',
  'URL', 'URI', 'JWT', 'OAuth', 'SSO', 'MFA', '2FA', 'SAML',
  'LDAP', 'AD', 'CLI', 'GUI', 'IDE', 'SDK', 'CPU', 'GPU', 'RAM',
  'SSD', 'HDD', 'NIC', 'PoE', 'QoS', 'SLA', 'SLO', 'MTTD', 'MTTR',
  'PACS', 'HIS', 'EMR', 'ERP', 'CRM', 'CI', 'CD', 'RBAC', 'ABAC',
  'IDC', 'BGP', 'OSPF', 'MPLS', 'L2', 'L3', 'L4', 'L7',
  // File type / format names
  'PDF', 'JPEG', 'PNG', 'WebP', 'GIF', 'SVG', 'MP4', 'MOV',
  // Common short terms used as labels (icons, units)
  'OK', 'Cancel',
  // Code block language labels
  'code', 'bash', 'shell', 'js', 'ts', 'jsx', 'tsx', 'python',
  'go', 'rust', 'java', 'c', 'cpp', 'sql', 'yaml', 'json', 'html',
  'css', 'dockerfile', 'ini', 'toml',
]);

// Phrases composed entirely of whitelist words + connectors
const WHITELIST_CONNECTORS = new Set(['&', 'and', 'or', 'Cloud']);

function isWhitelisted(text) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (WHITELIST.has(trimmed)) return true;
  // Multi-word: check if all words are whitelisted or connectors
  const words = trimmed.split(/\s+/);
  if (words.length > 1) {
    const allOk = words.every(w => WHITELIST.has(w) || WHITELIST_CONNECTORS.has(w));
    if (allOk) return true;
  }
  return false;
}

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────

function looksLikeEnglish(text) {
  if (!text) return false;
  // Has non-ASCII (e.g., Chinese) -> mixed or non-English
  if (/[^\x00-\x7F]/.test(text)) return false;
  // Must have at least one letter
  if (!/[a-zA-Z]/.test(text)) return false;
  return true;
}

function isLikelyNotUserFacing(text) {
  const t = text.trim();
  if (!t) return true;

  // Pure number
  if (/^\d+(\.\d+)?$/.test(t)) return true;
  // Single character
  if (t.length === 1) return true;

  // URLs
  if (/^https?:\/\//i.test(t)) return true;
  if (/^mailto:/i.test(t)) return true;
  if (/^tel:/i.test(t)) return true;

  // File paths (start with / and look like a path)
  if (/^\/(images|logos|api|_next|blog|products|solutions|videos)/i.test(t)) return true;
  if (/^\.(\/|\w)/.test(t)) return true; // relative paths
  if (/^[a-z]:[\\/]/i.test(t)) return true; // windows paths

  // Hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return true;

  // CSS class names (kebab-case, no spaces, lowercase start)
  if (/^[a-z][a-zA-Z0-9-]*$/.test(t) && t.includes('-')) {
    // Could be a CSS class like "max-w-7xl" or a slug like "ai-agent"
    // Heuristic: if it has typical CSS prefixes, skip
    if (/^(flex|grid|gap|px|py|p|m|text|bg|border|rounded|shadow|absolute|relative|w-|h-|min-|max-|sm:|md:|lg:|xl:|dark:|hover:|focus:|block|inline|hidden|fixed|sticky|top-|left-|right-|bottom-|z-|inset-|overflow|object|transition|duration|delay|animate|opacity|font|leading|tracking|uppercase|lowercase|rotate|scale|translate)/.test(t)) {
      return true;
    }
  }

  // Event handlers and snake_case identifiers
  if (/^[a-z][a-zA-Z0-9_]*$/.test(t) && t.includes('_')) return true;

  // Single-word lowercase identifier (likely a variable or key)
  if (/^[a-z][a-zA-Z0-9]*$/.test(t) && !t.includes(' ')) {
    // Could be a prop name, key, or variable - skip
    return true;
  }

  // PascalCase single word (could be a component name like 'Server' or type like 'TabKey')
  // We can't easily distinguish from product/brand names; treat as whitelisted if it's a single word
  if (/^[A-Z][a-zA-Z0-9]*$/.test(t) && !t.includes(' ')) return true;

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return true;

  // Just punctuation
  if (/^[=\-+*/<>{}[\]();,.`'"]+$/.test(t)) return true;

  // Date-like (e.g., 2026-07-19)
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return true;

  // Color rgb/rgba/hsl
  if (/^(rgb|hsl)a?\(/i.test(t)) return true;

  // Style value (e.g., "100%", "0.5s", "16px")
  if (/^\d*\.?\d+(px|em|rem|%|s|ms|vh|vw|fr|deg)?$/i.test(t)) return true;

  // Locale codes like en-US, zh-TW
  if (/^[a-z]{2}-[A-Z]{2}$/.test(t)) return true;

  return false;
}

// ───────────────────────────────────────────────────────────
// File walking
// ───────────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules', '.next', 'dist', 'build', '__tests__', '__mocks__',
]);

// Files explicitly out of current audit scope (maintained by other work waves).
// Each entry documents the owning wave / reason so it can be removed when that wave ships.
// Format: { pattern: RegExp, reason: string }
// Patterns are tested against BOTH the raw OS path and a forward-slash normalized path,
// so each `[\\/]` segment matches either a backslash or a forward slash.
const SKIP_FILES = [
  // Root layout: static metadata cannot be locale-aware without generateMetadata refactor
  { pattern: /src[\\/]app[\\/]layout\.tsx$/, reason: 'root layout metadata (W4-scope)' },
  // Locale layout: static metadata + Skip link + back-to-top aria-label (would need generateMetadata)
  { pattern: /src[\\/]app[\\/]\[locale\][\\/]layout\.tsx$/, reason: 'locale layout metadata (W4-scope)' },
  // About page: maintained by W2-5 (Sanity migration); "About Us" label comes from Breadcrumb
  { pattern: /src[\\/]app[\\/]\[locale\][\\/]about[\\/]page\.tsx$/, reason: 'W2-5 scope' },
  // Product detail page.tsx: not in W2-3 scope; "Product Not Found" + Breadcrumb labels
  { pattern: /src[\\/]app[\\/]\[locale\][\\/]products[\\/]\[slug\][\\/]page\.tsx$/, reason: 'product page.tsx (future wave)' },
  // Blog detail page.tsx: not in W2-3 scope; "Post Not Found"
  { pattern: /src[\\/]app[\\/]\[locale\][\\/]blog[\\/]\[slug\][\\/]page\.tsx$/, reason: 'blog page.tsx (future wave)' },
  // HeroSection: aria-labels added by W0-5 a11y task
  { pattern: /src[\\/]components[\\/]hero[\\/]HeroSection\.tsx$/, reason: 'W0-5 scope (hero a11y)' },
  // Navbar: aria-label
  { pattern: /src[\\/]components[\\/]layout[\\/]Navbar\.tsx$/, reason: 'navbar aria-label (future wave)' },
  // TicketForm: maintained by W1-3/W2-4
  { pattern: /src[\\/]components[\\/]tickets[\\/]TicketForm\.tsx$/, reason: 'W1-3/W2-4 scope' },
  // JsonLd: structured data, English by design for SEO
  { pattern: /src[\\/]components[\\/]ui[\\/]JsonLd\.tsx$/, reason: 'SEO structured data (English by design)' },
  // LanguageSwitcher: intentional locale toggle showing opposite language
  { pattern: /src[\\/]components[\\/]ui[\\/]LanguageSwitcher\.tsx$/, reason: 'intentional locale toggle' },
  // Tooltip: generic aria-label
  { pattern: /src[\\/]components[\\/]ui[\\/]Tooltip\.tsx$/, reason: 'generic tooltip aria-label (future wave)' },
];

function shouldSkipFile(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  for (const { pattern, reason } of SKIP_FILES) {
    if (pattern.test(relPath) || pattern.test(normalized)) {
      return { skip: true, reason };
    }
  }
  return { skip: false };
}

function walkDir(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkDir(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      if (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.spec.tsx')) continue;
      files.push(full);
    }
  }
  return files;
}

// ───────────────────────────────────────────────────────────
// Hardcoded text detection (line-based heuristics)
// ───────────────────────────────────────────────────────────

// Match string literals: 'foo', "foo", `foo` (template literals without interpolation)
const STRING_RE = /(['"`])((?:\\.|(?!\1).)*?)\1/g;

// Match JSX text between > and < (multi-word English text)
const JSX_TEXT_RE = />([^<>{}]+)</g;

// Match inline locale ternary: {locale === 'zh' ? ... : ...} or {isZh ? '...' : '...'}
// We use a candidate regex first, then verify there's at least one translatable string literal
// in either branch (so we don't flag legitimate Sanity data lookups like `obj.fieldZh || obj.field`).
const LOCALE_TERNARY_CANDIDATE_RE = /\{[^{}]*\b(?:locale|isZh)\s*(?:===|==|!==|!=)\s*['"](?:zh|en)['"][^{}]*\?[^{}]*:[^{}]*\}/g;

function ternaryHasTranslatableLiteral(ternaryText) {
  // Strip the locale comparator ('zh' or 'en') so we don't count it as a literal
  const cleaned = ternaryText.replace(/['"](?:zh|en)['"]/, ' ');
  // Find all string literals (single, double, or backtick without interpolation)
  const litRe = /(['"`])((?:\\.|(?!\1).)+)\1/g;
  let m;
  while ((m = litRe.exec(cleaned)) !== null) {
    const inner = m[2];
    if (!looksLikeEnglish(inner)) continue;
    if (isLikelyNotUserFacing(inner)) continue;
    if (isWhitelisted(inner)) continue;
    return true;
  }
  return false;
}

// Match object property: { label: '...' } or { title: '...' } etc.
const LABEL_PROP_RE = /\b(label|title|desc|description|placeholder|aria-label|alt|name|cert|certLabel)\s*:\s*(['"`])([^'"`]*)\2/g;

// Lines that should be skipped entirely
function isSkipLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^\s*(\/\/|\/\*|\*|<!--)/.test(line)) return true; // comment
  if (/^\s*(import|export)\s/.test(line)) return true; // import/export
  if (/^\s*\*\s+@/.test(line)) return true; // jsdoc
  return false;
}

// Check if a position is inside a t() call (heuristic: look back ~50 chars)
function isInsideTCall(line, position) {
  const before = line.slice(Math.max(0, position - 60), position);
  // Look for t( or t.raw( with optional whitespace, opening the call
  if (/\bt(?:\.raw)?\s*\(\s*$/.test(before)) return true;
  // Look for t( ... , 'string' - second arg of t() is usually a default value
  // We'll be permissive: any string appearing between t( and ) is considered safe
  return false;
}

function findHardcodedInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];

  // Check for file-level skip
  const fileTop = content.slice(0, 500);
  if (/i18n-audit-skip-file/.test(fileTop)) {
    return findings;
  }

  // Pre-compute line-by-line ignore markers
  const ignoreNextLine = new Set();
  const ignoreThisLine = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (/i18n-audit-ignore-next-line/.test(lines[i])) {
      ignoreNextLine.add(i + 1); // next line (0-indexed i+1)
    }
    if (/i18n-audit-ignore-line/.test(lines[i])) {
      ignoreThisLine.add(i);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    if (ignoreThisLine.has(i)) continue;
    if (i > 0 && ignoreNextLine.has(i - 1)) continue;
    // Actually ignoreNextLine.add(i+1) means line index i+1 should be ignored
    // Wait: we set ignoreNextLine.add(i + 1) when we see the comment at line i.
    // The "next line" after line i is line i+1 (0-indexed). So we want to ignore line index i+1.
    // Let me redo this:
    // (handled below)

    const line = lines[i];
    if (isSkipLine(line)) continue;

    // Skip lines that have a next-line ignore on the previous line
    // (the previous-line comment triggers ignoreNextLine.add(prevIndex + 1) == currentIndex)
    // We already added i+1 to ignoreNextLine when comment was at i.
    // So when we're at line i, we should check if ignoreNextLine has i (meaning comment was at i-1).
    if (ignoreNextLine.has(i)) continue;

    // 1. Detect inline locale ternary anti-pattern (only when branches contain string literals)
    let m;
    LOCALE_TERNARY_CANDIDATE_RE.lastIndex = 0;
    while ((m = LOCALE_TERNARY_CANDIDATE_RE.exec(line)) !== null) {
      const text = m[0].trim();
      if (!ternaryHasTranslatableLiteral(text)) continue;
      findings.push({
        file: path.relative(ROOT, filePath),
        line: i + 1,
        col: m.index + 1,
        text,
        type: 'locale-ternary',
      });
    }

    // 2. Detect label/title/desc/placeholder/aria-label/alt with string literal
    LABEL_PROP_RE.lastIndex = 0;
    while ((m = LABEL_PROP_RE.exec(line)) !== null) {
      const key = m[1];
      const value = m[3];
      if (!looksLikeEnglish(value)) continue;
      if (isLikelyNotUserFacing(value)) continue;
      if (isWhitelisted(value)) continue;
      if (isInsideTCall(line, m.index)) continue;
      findings.push({
        file: path.relative(ROOT, filePath),
        line: i + 1,
        col: m.index + 1,
        text: value,
        type: `object-property:${key}`,
      });
    }

    // 3. Detect JSX text children (English text between > and <)
    JSX_TEXT_RE.lastIndex = 0;
    while ((m = JSX_TEXT_RE.exec(line)) !== null) {
      const text = m[1].trim();
      if (!text) continue;
      if (!looksLikeEnglish(text)) continue;
      if (isLikelyNotUserFacing(text)) continue;
      if (isWhitelisted(text)) continue;
      // Skip if the text is just a single letter or short
      if (text.length < 4) continue;
      // Skip if it looks like a JS expression (likely a string used as a child)
      // e.g., `>      {t('foo')}      <` — but t('foo') is in {} so it won't match JSX_TEXT_RE
      // Skip if surrounded by { (likely a JS expression like {foo ? 'a' : 'b'})
      if (text.startsWith('{') || text.endsWith('}')) continue;

      findings.push({
        file: path.relative(ROOT, filePath),
        line: i + 1,
        col: m.index + 1,
        text,
        type: 'jsx-children',
      });
    }

    // 4. Detect string literals passed to specific JSX attributes
    // e.g., aria-label="..." or placeholder="..." or alt="..."
    const ATTR_RE = /\b(aria-label|placeholder|alt|title)\s*=\s*(["'])((?:\\.|(?!\2).)*)\2/g;
    ATTR_RE.lastIndex = 0;
    while ((m = ATTR_RE.exec(line)) !== null) {
      const attr = m[1];
      const value = m[3];
      if (!looksLikeEnglish(value)) continue;
      if (isLikelyNotUserFacing(value)) continue;
      if (isWhitelisted(value)) continue;
      if (isInsideTCall(line, m.index)) continue;
      findings.push({
        file: path.relative(ROOT, filePath),
        line: i + 1,
        col: m.index + 1,
        text: value,
        type: `jsx-attribute:${attr}`,
      });
    }
  }

  return findings;
}

// ───────────────────────────────────────────────────────────
// Key consistency check (existing functionality, preserved)
// ───────────────────────────────────────────────────────────

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function checkKeyConsistency() {
  let en, zh;
  try {
    en = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf8'));
    zh = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'zh.json'), 'utf8'));
  } catch (e) {
    return {
      valid: false,
      error: `JSON parse error: ${e.message}`,
      enKeys: 0,
      zhKeys: 0,
      missingInZh: [],
      missingInEn: [],
    };
  }

  const enKeys = new Set(getKeys(en));
  const zhKeys = new Set(getKeys(zh));

  const missingInZh = [...enKeys].filter(k => !zhKeys.has(k)).sort();
  const missingInEn = [...zhKeys].filter(k => !enKeys.has(k)).sort();

  return {
    valid: true,
    enKeys: enKeys.size,
    zhKeys: zhKeys.size,
    missingInZh,
    missingInEn,
  };
}

// ───────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────

function main() {
  const files = walkDir(SRC_DIR);
  const allFindings = [];
  const skipped = [];

  for (const file of files) {
    const relPath = path.relative(ROOT, file);
    const skipCheck = shouldSkipFile(relPath);
    if (skipCheck.skip) {
      skipped.push({ file: relPath, reason: skipCheck.reason });
      continue;
    }
    const findings = findHardcodedInFile(file);
    allFindings.push(...findings);
  }

  const keyCheck = checkKeyConsistency();

  const report = {
    generatedAt: new Date().toISOString(),
    scannedFiles: files.length - skipped.length,
    skippedFiles: skipped,
    hardcodedCount: allFindings.length,
    hardcoded: allFindings,
    keyConsistency: keyCheck,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // Console output
  console.log('═'.repeat(60));
  console.log('i18n Audit Report');
  console.log('═'.repeat(60));
  console.log(`Scanned ${report.scannedFiles} .tsx files in src/ (${skipped.length} skipped)`);
  console.log(`Hardcoded strings: ${allFindings.length}`);

  if (allFindings.length > 0) {
    console.log('\n─'.repeat(60) + ' Hardcoded strings');
    const byFile = new Map();
    for (const f of allFindings) {
      if (!byFile.has(f.file)) byFile.set(f.file, []);
      byFile.get(f.file).push(f);
    }
    for (const [file, items] of byFile) {
      console.log(`\n  ${file}:`);
      for (const it of items) {
        const preview = it.text.length > 60 ? it.text.slice(0, 57) + '...' : it.text;
        console.log(`    L${it.line}:${it.col}  [${it.type}]  "${preview}"`);
      }
    }
  }

  if (skipped.length > 0) {
    console.log('\n─'.repeat(60) + ' Skipped files (out of current scope)');
    for (const s of skipped) {
      console.log(`  ${s.file}  — ${s.reason}`);
    }
  }

  console.log('\n─'.repeat(60) + ' Key consistency');
  if (!keyCheck.valid) {
    console.log(`❌ ${keyCheck.error}`);
  } else {
    console.log(`EN keys: ${keyCheck.enKeys}, ZH keys: ${keyCheck.zhKeys}`);
    if (keyCheck.missingInZh.length > 0) {
      console.log(`\n❌ Missing in zh.json (${keyCheck.missingInZh.length}):`);
      for (const k of keyCheck.missingInZh) console.log(`   - ${k}`);
    }
    if (keyCheck.missingInEn.length > 0) {
      console.log(`\n❌ Missing in en.json (${keyCheck.missingInEn.length}):`);
      for (const k of keyCheck.missingInEn) console.log(`   - ${k}`);
    }
    if (keyCheck.missingInZh.length === 0 && keyCheck.missingInEn.length === 0) {
      console.log('✅ Keys aligned');
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`Report written: ${path.relative(ROOT, REPORT_PATH)}`);

  const keyIssues = keyCheck.valid
    ? keyCheck.missingInZh.length + keyCheck.missingInEn.length
    : 1;
  const hasIssues = allFindings.length > 0 || keyIssues > 0;

  if (hasIssues) {
    console.log(`\n❌ Audit failed: ${allFindings.length} hardcoded, ${keyIssues} key issues`);
    process.exit(1);
  } else {
    console.log('\n✅ Audit passed: no hardcoded strings, keys aligned');
    process.exit(0);
  }
}

main();
