// 测试Hook逻辑（模拟actor.postStop和tool.execute.after事件）

// 模拟actor.postStop事件
function testPostStop(input) {
  const output = { result: '' };
  if (input.result?.status === 'success' || input.result?.status === 'done') {
    output.result = (output.result || '') + '\n\n⚡ [auto-doc-sync] Task完成，请执行doc-sync检查三方文档一致性。';
  }
  return output;
}

// 模拟tool.execute.after事件
function testToolAfter(input) {
  const output = { result: '' };
  const cmd = input.args?.command || input.args?.content || input.args?.file_path || '';
  const isSanityChange = /sanity|createOrReplace|\.patch\(|\.set\(|contentZh|titleZh|coverImage/i.test(cmd);
  const isDocChange = /MEMORY\.md|AGENTS\.md|PRD-TechGuru/i.test(cmd);

  if (isSanityChange) {
    output.result += '\n\n⚡ [auto-doc-sync] Sanity数据已变更，请检查MEMORY.md中Sanity Content部分是否需要更新。';
  }
  if (isDocChange) {
    output.result += '\n\n⚡ [auto-doc-sync] 文档已变更，请运行doc-sync检查三方一致性。';
  }
  return output;
}

console.log('=== Hook逻辑测试 ===\n');

// 测试1: 子代理成功完成
const r1 = testPostStop({ result: { status: 'success', summary: 'Done' } });
console.log('测试1 (子代理成功):', r1.result.includes('auto-doc-sync') ? '✅ PASS' : '❌ FAIL');

// 测试2: 子代理失败
const r2 = testPostStop({ result: { status: 'failed', error: 'Error' } });
console.log('测试2 (子代理失败):', !r2.result.includes('auto-doc-sync') ? '✅ PASS - 不提醒' : '❌ FAIL - 错误提醒');

// 测试3: Sanity变更
const r3 = testToolAfter({ args: { command: 'node createOrReplace.mjs' } });
console.log('测试3 (Sanity变更):', r3.result.includes('Sanity') ? '✅ PASS' : '❌ FAIL');

// 测试4: 文档变更
const r4 = testToolAfter({ args: { file_path: 'MEMORY.md' } });
console.log('测试4 (文档变更):', r4.result.includes('doc-sync') ? '✅ PASS' : '❌ FAIL');

// 测试5: 无关操作
const r5 = testToolAfter({ args: { command: 'npm run build' } });
console.log('测试5 (无关操作):', !r5.result.includes('auto-doc-sync') ? '✅ PASS - 不提醒' : '❌ FAIL - 错误提醒');

// 测试6: Sanity内容变更
const r6 = testToolAfter({ args: { content: 'titleZh: 新标题' } });
console.log('测试6 (titleZh变更):', r6.result.includes('Sanity') ? '✅ PASS' : '❌ FAIL');

// 测试7: 无参数
const r7 = testPostStop({});
console.log('测试7 (无参数):', !r7.result.includes('auto-doc-sync') ? '✅ PASS - 不提醒' : '❌ FAIL');

console.log('\n=== 全部测试完成 ===');
