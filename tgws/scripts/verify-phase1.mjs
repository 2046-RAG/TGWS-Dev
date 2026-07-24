/**
 * Phase 1 安全修复自动验证脚本
 * 验证目标：M1 Cookie属性、M2 工单长度校验、M3 文件类型白名单、L1 联系表单长度、L2 状态枚举校验
 * 方法：读取源码文件 → 正则提取验证逻辑 → 构造测试用例 → 执行断言
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    results.push({ status: '✅ PASS', test: testName, detail });
  } else {
    failed++;
    results.push({ status: '❌ FAIL', test: testName, detail });
  }
}

// ========== M1: Cookie 属性传递 ==========
function verifyM1() {
  const code = readFileSync(join(ROOT, 'src/middleware.ts'), 'utf-8');

  // 用例1: httpOnly 属性被传递
  assert(code.includes('httpOnly: cookie.httpOnly'), 'M1-1', 'httpOnly 属性传递');

  // 用例2: secure 属性被传递
  assert(code.includes('secure: cookie.secure'), 'M1-2', 'secure 属性传递');

  // 用例3: sameSite 属性被传递
  assert(code.includes('sameSite: cookie.sameSite'), 'M1-3', 'sameSite 属性传递');

  // 用例4: path 属性被传递
  assert(code.includes('path: cookie.path'), 'M1-4', 'path 属性传递');

  // 用例5: maxAge 属性被传递
  assert(code.includes('maxAge: cookie.maxAge'), 'M1-5', 'maxAge 属性传递');

  // 用例6: 旧的只传 name+value 的代码不存在
  const oldPattern = /cookies\.set\(cookie\.name,\s*cookie\.value\)/;
  assert(!oldPattern.test(code), 'M1-6', '旧的 name+value 模式已移除');

  // 用例7: set 方法接收第三个 options 参数
  assert(/cookies\.set\(cookie\.name,\s*cookie\.value,\s*\{/.test(code), 'M1-7', 'set() 接收 options 对象');
}

// ========== M2: 工单 API 服务端校验 ==========
function verifyM2() {
  const code = readFileSync(join(ROOT, 'src/app/api/tickets/route.ts'), 'utf-8');

  // 用例1: category 枚举校验存在
  assert(code.includes("VALID_CATEGORIES.includes(category)"), 'M2-1', 'category 枚举校验');

  // 用例2: VALID_CATEGORIES 包含 build/run/protect
  assert(code.includes("'build'") && code.includes("'run'") && code.includes("'protect'"), 'M2-2', 'VALID_CATEGORIES 含 build/run/protect');

  // 用例3: subject 长度校验存在 (≤200)
  assert(code.includes('subject.length > 200'), 'M2-3', 'subject ≤200 校验');

  // 用例4: description 长度校验存在 (≤800)
  assert(code.includes('description.length > 800'), 'M2-4', 'description ≤800 校验');

  // 用例5: 校验在 insert 之前（顺序检查）
  const validationIdx = code.indexOf('VALID_CATEGORIES');
  const insertIdx = code.indexOf('.insert(');
  assert(validationIdx > 0 && insertIdx > validationIdx, 'M2-5', '校验在数据库插入之前');

  // 用例6: 校验失败返回 400 状态码
  assert(code.includes("'Invalid category'") && code.includes('400'), 'M2-6', '非法 category 返回 400');
}

// ========== M3: 文件上传类型白名单 ==========
function verifyM3() {
  const code = readFileSync(join(ROOT, 'src/app/api/upload/route.ts'), 'utf-8');

  // 用例1: ALLOWED_TYPES 数组存在
  assert(code.includes('ALLOWED_TYPES'), 'M3-1', 'ALLOWED_TYPES 数组定义存在');

  // 用例2: 包含图片类型
  assert(code.includes("'image/jpeg'") && code.includes("'image/png'") && code.includes("'image/gif'"), 'M3-2', '包含图片类型 (jpeg/png/gif)');

  // 用例3: 包含 PDF 类型
  assert(code.includes("'application/pdf'"), 'M3-3', '包含 PDF 类型');

  // 用例4: 包含文档类型
  assert(code.includes("'application/msword'") || code.includes("'application/vnd.openxmlformats'"), 'M3-4', '包含文档类型');

  // 用例5: 类型校验逻辑存在
  assert(code.includes('ALLOWED_TYPES.includes(file.type)'), 'M3-5', '类型校验逻辑 exists');

  // 用例6: 校验在 size 检查之后（顺序合理）
  const sizeIdx = code.indexOf('file.size > MAX_SIZE');
  const typeIdx = code.indexOf('ALLOWED_TYPES.includes');
  assert(sizeIdx > 0 && typeIdx > sizeIdx, 'M3-6', '类型校验在大小校验之后');

  // 用例7: 非法类型返回 400
  assert(code.includes("'File type not allowed'") && code.includes('400'), 'M3-7', '非法类型返回 400');

  // 用例8: .exe 不在白名单中
  assert(!code.includes("'application/x-msdownload'") && !code.includes("'application/x-executable'"), 'M3-8', '.exe MIME 类型不在白名单中');
}

// ========== L1: 联系表单长度校验 ==========
function verifyL1() {
  const code = readFileSync(join(ROOT, 'src/app/api/contact/route.ts'), 'utf-8');

  // 用例1: name 长度校验存在 (≤100)
  assert(code.includes('name.length > 100'), 'L1-1', 'name ≤100 校验');

  // 用例2: message 长度校验存在 (≤5000)
  assert(code.includes('message.length > 5000'), 'L1-2', 'message ≤5000 校验');

  // 用例3: 校验在数据库插入之前
  const nameCheckIdx = code.indexOf('name.length > 100');
  const insertIdx = code.indexOf('.insert(');
  assert(nameCheckIdx > 0 && insertIdx > nameCheckIdx, 'L1-3', '长度校验在数据库插入之前');

  // 用例4: 校验失败返回 400
  assert(code.includes("'Name must be 100 characters or less'") && code.includes('400'), 'L1-4', 'name 超长返回 400');
  assert(code.includes("'Message must be 5000 characters or less'") && code.includes('400'), 'L1-5', 'message 超长返回 400');
}

// ========== L2: 工单状态枚举校验 ==========
function verifyL2() {
  const code = readFileSync(join(ROOT, 'src/app/api/tickets/[id]/route.ts'), 'utf-8');

  // 用例1: VALID_STATUSES 数组存在
  assert(code.includes('VALID_STATUSES'), 'L2-1', 'VALID_STATUSES 定义存在');

  // 用例2: VALID_PRIORITIES 数组存在
  assert(code.includes('VALID_PRIORITIES'), 'L2-2', 'VALID_PRIORITIES 定义存在');

  // 用例3: VALID_STATUSES 包含全部4个合法值
  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  const allPresent = statuses.every(s => code.includes(`'${s}'`));
  assert(allPresent, 'L2-3', 'VALID_STATUSES 含 open/in_progress/resolved/closed');

  // 用例4: VALID_PRIORITIES 包含全部4个合法值
  const priorities = ['low', 'medium', 'high', 'critical'];
  const allPrioritiesPresent = priorities.every(p => code.includes(`'${p}'`));
  assert(allPrioritiesPresent, 'L2-4', 'VALID_PRIORITIES 含 low/medium/high/critical');

  // 用例5: status 校验逻辑存在
  assert(code.includes('VALID_STATUSES.includes(body.status)'), 'L2-5', 'status 枚举校验逻辑');

  // 用例6: priority 校验逻辑存在
  assert(code.includes('VALID_PRIORITIES.includes(body.priority)'), 'L2-6', 'priority 枚举校验逻辑');

  // 用例7: 校验在 supabase.update 之前
  const statusCheckIdx = code.indexOf('VALID_STATUSES.includes');
  const updateIdx = code.indexOf('.update(');
  assert(statusCheckIdx > 0 && updateIdx > statusCheckIdx, 'L2-7', '枚举校验在数据库更新之前');

  // 用例8: 校验失败返回 400
  assert(code.includes("'Invalid status value'") && code.includes('400'), 'L2-8', '非法 status 返回 400');
  assert(code.includes("'Invalid priority value'") && code.includes('400'), 'L2-9', '非法 priority 返回 400');
}

// ========== 执行所有验证 ==========
console.log('='.repeat(60));
console.log('Phase 1 安全修复 - 自动化验证报告');
console.log('='.repeat(60));

console.log('\n📋 M1: Cookie 属性传递 (middleware.ts)');
verifyM1();

console.log('\n📋 M2: 工单 API 服务端校验 (api/tickets/route.ts)');
verifyM2();

console.log('\n📋 M3: 文件上传类型白名单 (api/upload/route.ts)');
verifyM3();

console.log('\n📋 L1: 联系表单长度校验 (api/contact/route.ts)');
verifyL1();

console.log('\n📋 L2: 工单状态枚举校验 (api/tickets/[id]/route.ts)');
verifyL2();

// ========== 输出结果 ==========
console.log('\n' + '='.repeat(60));
console.log('验证结果汇总');
console.log('='.repeat(60));

for (const r of results) {
  console.log(`  ${r.status}  ${r.test} — ${r.detail}`);
}

console.log('\n' + '-'.repeat(60));
console.log(`总计: ${passed + failed} 项 | ✅ 通过: ${passed} | ❌ 失败: ${failed}`);
console.log('-'.repeat(60));

if (failed > 0) {
  console.log('\n⚠️  有验证未通过，请检查对应文件。');
  process.exit(1);
} else {
  console.log('\n🎉 全部验证通过！Phase 1 安全修复已确认。');
}
