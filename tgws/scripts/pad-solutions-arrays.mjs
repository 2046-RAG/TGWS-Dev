import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const enPath = resolve(process.cwd(), 'src/messages/en.json');
const zhPath = resolve(process.cwd(), 'src/messages/zh.json');

const enData = JSON.parse(readFileSync(enPath, 'utf-8'));
const zhData = JSON.parse(readFileSync(zhPath, 'utf-8'));

const industries = ['healthcare', 'finance', 'retail', 'logistics', 'education', 'government'];

for (const industry of industries) {
  // Pad solutions array to 3 items
  while (enData.solutions.industries[industry].solutions.length < 3) {
    enData.solutions.industries[industry].solutions.push('Additional infrastructure requirements');
  }
  while (zhData.solutions.industries[industry].solutions.length < 3) {
    zhData.solutions.industries[industry].solutions.push('其他基礎設施需求');
  }
  
  // Pad products array to 3 items
  while (enData.solutions.industries[industry].products.length < 3) {
    enData.solutions.industries[industry].products.push('AI-powered automation');
  }
  while (zhData.solutions.industries[industry].products.length < 3) {
    zhData.solutions.industries[industry].products.push('AI自動化');
  }
}

writeFileSync(enPath, JSON.stringify(enData, null, 2));
writeFileSync(zhPath, JSON.stringify(zhData, null, 2));

console.log('Padded solutions arrays to 3 items each');
