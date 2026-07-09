import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const enPath = resolve(process.cwd(), 'src/messages/en.json');
const zhPath = resolve(process.cwd(), 'src/messages/zh.json');

const enData = JSON.parse(readFileSync(enPath, 'utf-8'));
const zhData = JSON.parse(readFileSync(zhPath, 'utf-8'));

const industries = ['healthcare', 'finance', 'retail', 'logistics', 'education', 'government'];

for (const industry of industries) {
  // Fix en.json
  if (enData.solutions.industries[industry].infrastructureNeeds) {
    const needs = enData.solutions.industries[industry].infrastructureNeeds;
    // Split by period and take first 3 sentences as array
    const sentences = needs.split(/\.\s+/).filter(s => s.length > 10).slice(0, 3);
    enData.solutions.industries[industry].solutions = sentences;
    delete enData.solutions.industries[industry].infrastructureNeeds;
  }
  
  if (enData.solutions.industries[industry].aiSolutions) {
    const solutions = enData.solutions.industries[industry].aiSolutions;
    // Split by period and take first 3 sentences as array
    const sentences = solutions.split(/\.\s+/).filter(s => s.length > 10).slice(0, 3);
    enData.solutions.industries[industry].products = sentences;
    delete enData.solutions.industries[industry].aiSolutions;
  }
  
  // Fix zh.json
  if (zhData.solutions.industries[industry].infrastructureNeeds) {
    const needs = zhData.solutions.industries[industry].infrastructureNeeds;
    const sentences = needs.split(/[。；]+/).filter(s => s.length > 5).slice(0, 3);
    zhData.solutions.industries[industry].solutions = sentences;
    delete zhData.solutions.industries[industry].infrastructureNeeds;
  }
  
  if (zhData.solutions.industries[industry].aiSolutions) {
    const solutions = zhData.solutions.industries[industry].aiSolutions;
    const sentences = solutions.split(/[。；]+/).filter(s => s.length > 5).slice(0, 3);
    zhData.solutions.industries[industry].products = sentences;
    delete zhData.solutions.industries[industry].aiSolutions;
  }
}

writeFileSync(enPath, JSON.stringify(enData, null, 2));
writeFileSync(zhPath, JSON.stringify(zhData, null, 2));

console.log('Fixed solutions i18n structure');
