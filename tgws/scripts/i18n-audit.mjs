#!/usr/bin/env node
// i18n 一致性审计脚本
// 用法: node scripts/i18n-audit.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(__dirname, '../src/messages');

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

function getValues(obj, prefix = '') {
  let entries = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      entries = entries.concat(getValues(v, full));
    } else {
      entries.push({ key: full, value: v });
    }
  }
  return entries;
}

// Load files
let en, zh;
try {
  en = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf8'));
  zh = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'zh.json'), 'utf8'));
  console.log('✅ JSON 格式有效\n');
} catch (e) {
  console.log('❌ JSON 格式错误:', e.message);
  process.exit(1);
}

// Check key completeness
const enKeys = new Set(getKeys(en));
const zhKeys = new Set(getKeys(zh));

const missingInZh = [...enKeys].filter(k => !zhKeys.has(k));
const missingInEn = [...zhKeys].filter(k => !enKeys.has(k));

console.log(`📊 Key 统计: en.json=${enKeys.size}, zh.json=${zhKeys.size}`);
console.log(`   差异: en独有=${missingInZh.length}, zh独有=${missingInEn.length}\n`);

if (missingInZh.length > 0) {
  console.log('❌ zh.json 缺少的 key:');
  missingInZh.forEach(k => console.log(`   - ${k}`));
  console.log();
}

if (missingInEn.length > 0) {
  console.log('❌ en.json 缺少的 key:');
  missingInEn.forEach(k => console.log(`   - ${k}`));
  console.log();
}

// Check empty values
const enValues = getValues(en);
const zhValues = getValues(zh);
const emptyEn = enValues.filter(v => v.value === '' || v.value === null);
const emptyZh = zhValues.filter(v => v.value === '' || v.value === null);

if (emptyEn.length > 0) {
  console.log('⚠️ en.json 空值:');
  emptyEn.forEach(v => console.log(`   - ${v.key}`));
  console.log();
}

if (emptyZh.length > 0) {
  console.log('⚠️ zh.json 空值:');
  emptyZh.forEach(v => console.log(`   - ${v.key}`));
  console.log();
}

// Check placeholder consistency
const placeholderRegex = /\{(\w+)\}/g;
let placeholderIssues = 0;

for (const key of enKeys) {
  if (!zhKeys.has(key)) continue;
  
  const enVal = key.split('.').reduce((o, k) => o?.[k], en);
  const zhVal = key.split('.').reduce((o, k) => o?.[k], zh);
  
  if (typeof enVal !== 'string' || typeof zhVal !== 'string') continue;
  
  const enPlaceholders = [...enVal.matchAll(placeholderRegex)].map(m => m[1]).sort();
  const zhPlaceholders = [...zhVal.matchAll(placeholderRegex)].map(m => m[1]).sort();
  
  if (JSON.stringify(enPlaceholders) !== JSON.stringify(zhPlaceholders)) {
    console.log(`⚠️ 占位符不一致: ${key}`);
    console.log(`   en: ${enPlaceholders.join(', ') || '(无)'}`);
    console.log(`   zh: ${zhPlaceholders.join(', ') || '(无)'}`);
    placeholderIssues++;
  }
}

// Summary
console.log('─'.repeat(50));
const totalIssues = missingInZh.length + missingInEn.length + placeholderIssues;
if (totalIssues === 0) {
  console.log('✅ 审计通过: 无问题');
} else {
  console.log(`📊 审计完成: ${totalIssues} 个问题`);
}
