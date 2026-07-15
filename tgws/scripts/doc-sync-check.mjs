#!/usr/bin/env node

/**
 * TGWS 文档同步检查脚本
 * 
 * 检查 MEMORY.md、AGENTS.md、PRD 三方一致性
 * 
 * 用法:
 *   node scripts/doc-sync-check.mjs           # 基础检查
 *   node scripts/doc-sync-check.mjs --verbose  # 详细输出
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 路径配置
const PROJECT_ROOT = join(__dirname, '..');
const TGWS_ROOT = join(PROJECT_ROOT, '..');
const MEMORY_PATH = 'C:\\Users\\Test\\.local\\share\\mimocode\\memory\\projects\\b897d9ae-bfcc-4a5a-9263-c91b1d7efed1\\MEMORY.md';
const AGENTS_PATH = join(TGWS_ROOT, 'AGENTS.md');
const PRD_PATH = join(TGWS_ROOT, 'PRD-TechGuru-Website.md');

const verbose = process.argv.includes('--verbose');

function readFile(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

function check(name, fn) {
  try {
    const result = fn();
    return { name, passed: true, detail: result };
  } catch (error) {
    return { name, passed: false, detail: error.message };
  }
}

// ═══════════════════════════════════════════════
// 检查项
// ═══════════════════════════════════════════════

const checks = [
  // 第一层：状态同步
  check('MEMORY.md 可读', () => {
    const content = readFile(MEMORY_PATH);
    if (!content) throw new Error('文件不存在或无法读取');
    return `大小: ${content.length} 字符`;
  }),

  check('MEMORY.md 待办部分存在', () => {
    const content = readFile(MEMORY_PATH);
    if (!content) throw new Error('MEMORY.md不可读');
    const match = content.match(/## 待办[\s\S]*?(?=## 核心规则|$)/);
    if (!match) throw new Error('未找到"## 待办"部分');
    return `找到待办部分 (${match[0].length} 字符)`;
  }),

  check('MEMORY.md 已完成列表存在', () => {
    const content = readFile(MEMORY_PATH);
    if (!content) throw new Error('MEMORY.md不可读');
    const match = content.match(/### 已完成[\s\S]*?(?=### 待执行|### 悬停|$)/);
    if (!match) throw new Error('未找到"### 已完成"部分');
    const rows = (match[0].match(/\|/g) || []).length;
    return `找到已完成部分 (${rows} 行)`;
  }),

  check('MEMORY.md 待执行列表存在', () => {
    const content = readFile(MEMORY_PATH);
    if (!content) throw new Error('MEMORY.md不可读');
    const match = content.match(/### 待执行[\s\S]*?(?=### 悬停|## 核心规则|$)/);
    if (!match) throw new Error('未找到"### 待执行"部分');
    const rows = (match[0].match(/\|/g) || []).length;
    return `找到待执行部分 (${rows} 行)`;
  }),

  check('AGENTS.md 可读', () => {
    const content = readFile(AGENTS_PATH);
    if (!content) throw new Error('文件不存在或无法读取');
    return `大小: ${content.length} 字符`;
  }),

  check('AGENTS.md 无Open Items表格', () => {
    const content = readFile(AGENTS_PATH);
    if (!content) throw new Error('AGENTS.md不可读');
    const match = content.match(/## Open Items[\s\S]*?(?=\n##|\n---|$)/);
    if (match) throw new Error('发现Open Items表格（应已移除）');
    return 'AGENTS.md符合职责划分';
  }),

  check('PRD [S22] 可读', () => {
    const content = readFile(PRD_PATH);
    if (!content) throw new Error('文件不存在或无法读取');
    const match = content.match(/\[S22\][\s\S]*?(?=\n## |\n---|$)/);
    if (!match) throw new Error('未找到[S22]部分');
    return `找到[S22]部分 (${match[0].length} 字符)`;
  }),

  // 第二层：设计同步
  check('PRD 页面结构存在', () => {
    const content = readFile(PRD_PATH);
    if (!content) throw new Error('PRD不可读');
    const match = content.match(/\[S4\]|网站架构|页面结构/i);
    if (!match) throw new Error('未找到[S4]网站架构/页面结构');
    return '找到[S4]网站架构/页面结构';
  }),

  check('PRD 技术栈存在', () => {
    const content = readFile(PRD_PATH);
    if (!content) throw new Error('PRD不可读');
    const match = content.match(/技术栈|Tech Stack/i);
    if (!match) throw new Error('未找到技术栈');
    return '找到技术栈';
  }),

  // 第三层：内容完整性
  check('en.json 可读', () => {
    const enPath = join(PROJECT_ROOT, 'src', 'messages', 'en.json');
    const content = readFile(enPath);
    if (!content) throw new Error('文件不存在或无法读取');
    return `大小: ${content.length} 字符`;
  }),

  check('zh.json 可读', () => {
    const zhPath = join(PROJECT_ROOT, 'src', 'messages', 'zh.json');
    const content = readFile(zhPath);
    if (!content) throw new Error('文件不存在或无法读取');
    return `大小: ${content.length} 字符`;
  }),

  // 第四层：文档间一致性
  check('docs/archive 目录存在', () => {
    const archivePath = join(TGWS_ROOT, 'docs', 'archive');
    if (!existsSync(archivePath)) throw new Error('归档目录不存在');
    const files = readdirSync(archivePath);
    return `归档目录包含 ${files.length} 个文件`;
  }),

  check('doc-sync skill 存在', () => {
    const skillPath = join(TGWS_ROOT, '.mimocode', 'skills', 'doc-sync', 'SKILL.md');
    if (!existsSync(skillPath)) throw new Error('doc-sync skill不存在');
    return 'doc-sync skill已配置';
  }),

  check('auto-doc-sync hook 存在', () => {
    const hookPath = join(TGWS_ROOT, '.mimocode', 'hooks', 'auto-doc-sync.ts');
    if (!existsSync(hookPath)) throw new Error('auto-doc-sync hook不存在');
    return 'auto-doc-sync hook已配置';
  }),
];

// ═══════════════════════════════════════════════
// 输出结果
// ═══════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════');
console.log('TGWS 文档同步检查');
console.log('═══════════════════════════════════════════════\n');

const passed = checks.filter(c => c.passed);
const failed = checks.filter(c => !c.passed);

checks.forEach(c => {
  const icon = c.passed ? '✅' : '❌';
  console.log(`${icon} ${c.name}`);
  if (verbose || !c.passed) {
    console.log(`   ${c.detail}`);
  }
});

console.log('\n───────────────────────────────────────────────');
console.log(`总计: ${checks.length} 项 | 通过: ${passed.length} | 失败: ${failed.length}`);

if (failed.length > 0) {
  console.log('\n❌ 失败项:');
  failed.forEach(c => {
    console.log(`  - ${c.name}: ${c.detail}`);
  });
}

console.log('───────────────────────────────────────────────\n');

process.exit(failed.length > 0 ? 1 : 0);