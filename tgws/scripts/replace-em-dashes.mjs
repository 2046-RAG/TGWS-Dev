import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const enPath = resolve(process.cwd(), 'src/messages/en.json');
const zhPath = resolve(process.cwd(), 'src/messages/zh.json');

function replaceEmDashes(content) {
  // Replace em-dash with period or appropriate punctuation
  // Pattern: "text — text" → "text. Text" (capitalize next letter)
  // Pattern: "text —" → "text." (end of sentence)
  
  let result = content;
  
  // Replace " — " with ". " (period + space)
  result = result.replace(/ — /g, '. ');
  
  // Replace "—" at end of string with "."
  result = result.replace(/—$/gm, '.');
  
  // Replace "—" at start of string (rare)
  result = result.replace(/^—/gm, '');
  
  return result;
}

const enContent = readFileSync(enPath, 'utf-8');
const zhContent = readFileSync(zhPath, 'utf-8');

const enNew = replaceEmDashes(enContent);
const zhNew = replaceEmDashes(zhContent);

writeFileSync(enPath, enNew);
writeFileSync(zhPath, zhNew);

// Count remaining em-dashes
const enCount = (enNew.match(/—/g) || []).length;
const zhCount = (zhNew.match(/—/g) || []).length;

console.log(`Replaced em-dashes in en.json: ${enCount} remaining`);
console.log(`Replaced em-dashes in zh.json: ${zhCount} remaining`);
