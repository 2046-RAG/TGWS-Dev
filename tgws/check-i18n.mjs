import fs from 'fs';

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('src/messages/zh.json', 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getKeys(en);
const zhKeys = getKeys(zh);

const enSet = new Set(enKeys);
const zhSet = new Set(zhKeys);

const missingInZh = enKeys.filter(k => !zhSet.has(k));
const missingInEn = zhKeys.filter(k => !enSet.has(k));

console.log('=== i18n Key Alignment ===');
console.log('EN keys:', enKeys.length);
console.log('ZH keys:', zhKeys.length);
console.log('\nMissing in ZH:', missingInZh.length);
missingInZh.forEach(k => console.log(`  - ${k}`));
console.log('\nMissing in EN:', missingInEn.length);
missingInEn.forEach(k => console.log(`  - ${k}`));
