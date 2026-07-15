#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SANITY_PROJECT_ID = 'r6ztl1oq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_TOKEN = 'REPLACED_SANITY_TOKEN';
const MUTATE_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}?returnIds=true`;

function toBlocks(text) {
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const trimmed = line.trim();
    let style = 'normal';
    if (trimmed.startsWith('# ')) style = 'h1';
    else if (trimmed.startsWith('## ')) style = 'h2';
    else if (trimmed.startsWith('### ')) style = 'h3';
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) style = 'bullet';
    else if (trimmed.startsWith('**Q:') || trimmed.startsWith('Q:')) style = 'h3';
    else if (/^\d+\./.test(trimmed)) style = 'number';
    
    let text = trimmed.replace(/^#+\s*/, '').replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
    
    return {
      _type: 'block',
      style,
      children: [{ _type: 'span', text }]
    };
  });
}

async function createPost(article) {
  const mutations = [{
    createOrReplace: {
      _type: 'post',
      _id: 'post-' + article.slug,
      title: { en: article.title, zh: article.titleZh },
      titleZh: article.titleZh,
      slug: { current: article.slug },
      category: 'technical',
      excerpt: { en: article.excerpt, zh: article.excerptZh },
      excerptZh: article.excerptZh,
      content: toBlocks(article.contentEn),
      contentZh: toBlocks(article.contentZh),
      coverImage: 'https://picsum.photos/seed/' + article.slug + '/800/450',
      language: 'en',
      publishedAt: '2025-05-01T00:00:00Z'
    }
  }];

  const response = await fetch(MUTATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SANITY_TOKEN
    },
    body: JSON.stringify({ mutations })
  });

  const result = await response.json();
  if (result.error) throw new Error('Sanity error: ' + JSON.stringify(result.error));
  return result;
}

async function main() {
  const { articles } = require('./articles-data.js');
  
  console.log('Starting batch creation of ' + articles.length + ' blog posts (C-series #63-#72)...\n');
  
  let success = 0, fail = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const num = i + 63;
    try {
      console.log('[' + num + '/72] Creating: ' + a.title);
      const result = await createPost(a);
      const id = result.results && result.results[0] ? result.results[0].id : 'unknown';
      console.log('  OK: ' + a.slug + ' (ID: ' + id + ')');
      success++;
    } catch (e) {
      console.error('  FAIL: ' + a.slug + ' - ' + e.message);
      fail++;
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('BATCH COMPLETE');
  console.log('Total: ' + articles.length + ' | Success: ' + success + ' | Failed: ' + fail);
  console.log('='.repeat(60));
}

main().catch(console.error);
