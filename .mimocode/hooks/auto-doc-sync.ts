// Hook: 每次工具调用后，三方文档完整状态同步
// 
// 职责划分:
// - Skill (doc-sync/SKILL.md): 定义"what to check"（4层47项检查清单）
// - Hook (本文件): 定义"when to check"（tool.execute.after触发）
//
// 本Hook只做轻量级状态同步，完整检查由Skill执行

import * as fs from 'fs';

const MEMORY_PATH = 'C:\\Users\\Test\\.local\\share\\mimocode\\memory\\projects\\b897d9ae-bfcc-4a5a-9263-c91b1d7efed1\\MEMORY.md';

function readFile(path: string): string {
  try { return fs.readFileSync(path, 'utf-8'); } catch { return ''; }
}

// ═══════════════════════════════════════════════
// 轻量级状态检查
// ═══════════════════════════════════════════════

interface StatusCheck {
  name: string;
  passed: boolean;
  detail?: string;
}

function quickStatusCheck(): StatusCheck[] {
  const checks: StatusCheck[] = [];
  const memory = readFile(MEMORY_PATH);

  if (!memory) {
    checks.push({ name: 'MEMORY.md可读', passed: false, detail: '文件不存在' });
    return checks;
  }

  checks.push({ name: 'MEMORY.md可读', passed: true });

  // 检查待办部分
  const todoMatch = memory.match(/## 待办/);
  checks.push({ name: '待办部分存在', passed: !!todoMatch });

  // 检查已完成列表
  const completedMatch = memory.match(/### 已完成/);
  checks.push({ name: '已完成列表存在', passed: !!completedMatch });

  // 检查待执行列表
  const pendingMatch = memory.match(/### 待执行/);
  checks.push({ name: '待执行列表存在', passed: !!pendingMatch });

  return checks;
}

// ═══════════════════════════════════════════════
// Sanity变更检测
// ═══════════════════════════════════════════════

function detectSanityChange(input: any): boolean {
  const args = input.args || {};
  const cmd = args.command || args.content || args.file_path || '';
  return /sanity|createOrReplace|\.patch\(|\.set\(|contentZh|titleZh|coverImage/i.test(cmd);
}

// ═══════════════════════════════════════════════
// 导出Hook
// ═══════════════════════════════════════════════

export default {
  "tool.execute.after": async (input: any, output: any) => {
    const messages: string[] = [];

    // 1. 快速状态检查
    const checks = quickStatusCheck();
    const failed = checks.filter(c => !c.passed);
    
    if (failed.length > 0) {
      messages.push(`⚠️ 状态检查: ${failed.map(f => f.name).join(', ')} 失败`);
    }

    // 2. Sanity变更检测
    if (detectSanityChange(input)) {
      messages.push('⚡ Sanity数据已变更 - 建议运行 doc-sync-check 完整检查');
    }

    // 3. 输出提示
    if (messages.length > 0) {
      output.result = (output.result || '') + '\n\n[auto-doc-sync]\n' + messages.join('\n');
    }
  },
};