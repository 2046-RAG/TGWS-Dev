---
name: i18n-audit
description: i18n一致性审计技能 - 自动检查en.json/zh.json的key对齐、缺失翻译、重复key、格式问题。当修改翻译文件后触发。
---

# i18n 一致性审计技能

## 触发条件

- 修改 en.json 或 zh.json 后
- 用户说"检查翻译"、"i18n audit"、"翻译一致性"
- 添加新功能涉及多语言时

## 检查清单

### P0 必检项

| # | 检查项 | 方法 | 通过标准 |
|---|--------|------|----------|
| 1 | key 完整性 | 解析两个文件，对比 key 列表 | en.json 的每个 key 在 zh.json 中都存在，反之亦然 |
| 2 | 嵌套深度一致 | 解析两个文件，对比嵌套层级 | 相同 key 的嵌套深度相同 |
| 3 | 无重复 key | 检查同一层级是否有重复 key | 同一层级无重复 |
| 4 | JSON 格式有效 | JSON.parse 验证 | 无语法错误 |

### P1 建议检查项

| # | 检查项 | 方法 | 通过标准 |
|---|--------|------|----------|
| 5 | 翻译非空 | 检查所有叶节点值 | 无空字符串值 |
| 6 | 占位符一致 | 检查 {xxx} 占位符 | en 和 zh 中的占位符名称和数量一致 |
| 7 | metadata 完整 | 检查所有 metadata namespace | 每个页面路由都有对应 metadata |
| 8 | 未使用 key | 对比 en.json key 与组件 t() 调用 | 无孤立 key（可选，需扫描组件） |

## 执行流程

```
1. 读取 en.json (用 node -e 精确读取，不用 read 整文件)
2. 读取 zh.json (同上)
3. 递归对比 key 树
4. 输出差异报告
5. 如有 P0 问题 → 自动修复
6. 如有 P1 问题 → 标记警告
```

## 执行脚本

```javascript
// node -e 检查脚本示例
const en = require('./messages/en.json');
const zh = require('./messages/zh.json');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys = keys.concat(getKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
const zhKeys = new Set(getKeys(zh));

const missingInZh = [...enKeys].filter(k => !zhKeys.has(k));
const missingInEn = [...zhKeys].filter(k => !enKeys.has(k));

console.log('Missing in zh.json:', missingInZh.length);
console.log('Missing in en.json:', missingInEn.length);
```

## 输出格式

```markdown
# i18n 审计报告

## 检查结果
- ✅ JSON 格式有效
- ❌ key 不完整: zh.json 缺少 3 个 key
  - `compare.metadata.title`
  - `compare.metadata.description`
  - `support.metadataLogin`
- ⚠️ 占位符不一致: `contact.welcome` 中 en 有 {name} 但 zh 无

## 修复建议
1. 在 zh.json 中添加缺失的 3 个 key
2. 检查 contact.welcome 的 zh 翻译是否遗漏占位符
```
