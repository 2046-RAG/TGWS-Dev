#!/usr/bin/env node
// 部署前验证脚本
// 用法: node scripts/pre-deploy.mjs [--fast]

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');
const isFast = process.argv.includes('--fast');

function run(cmd, label) {
  process.stdout.write(`[${label}] `);
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 120000, cwd: PROJECT_DIR });
    console.log('✅');
    return true;
  } catch (e) {
    console.log('❌');
    const output = e.stdout?.toString() || e.stderr?.toString() || '';
    const lastLines = output.split('\n').slice(-10).join('\n');
    console.log(lastLines);
    return false;
  }
}

console.log('🔍 Pre-deploy 检查\n');

// 阶段 1: 静态检查（lint/typecheck 失败不阻止部署，仅警告）
run('npm run lint', '1/4 Lint');
run('npx tsc --noEmit', '2/4 TypeCheck');

// 阶段 2: 构建验证（失败则阻止部署）
if (!run('npx next build', '3/4 Build')) {
  console.log('\n❌ 构建失败，停止部署');
  process.exit(1);
}

// 阶段 3: 测试（快速模式跳过）
if (!isFast) {
  run('npm test', '4/4 Tests');
} else {
  console.log('[4/4 Tests] ⏭️ 跳过（快速模式）');
}

console.log('\n✅ 构建通过，可以部署');
