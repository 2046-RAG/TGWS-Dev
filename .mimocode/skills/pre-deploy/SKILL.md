---
name: pre-deploy
description: 部署前自动验证技能 - 部署前自动运行lint/typecheck/build/测试，确保代码质量。当用户说"部署"、"deploy"时触发。
---

# 部署前验证技能

## 触发条件

- 用户说"部署"、"deploy"、"上线"
- 每次 `npx vercel --prod` 前自动执行
- 大规模代码变更后

## 验证清单

### 阶段 1：静态检查（<30s）

| # | 检查项 | 命令 | 通过标准 |
|---|--------|------|----------|
| 1 | Lint | `npm run lint` | 0 errors |
| 2 | TypeCheck | `npx tsc --noEmit` | 0 errors |

### 阶段 2：构建验证（<60s）

| # | 检查项 | 命令 | 通过标准 |
|---|--------|------|----------|
| 3 | Build | `npx next build` | 成功，无 ERROR |
| 4 | 页面数 | 检查构建输出 | 与上次一致（±1） |

### 阶段 3：测试验证（<60s）

| # | 检查项 | 命令 | 通过标准 |
|---|--------|------|----------|
| 5 | 单元测试 | `npm test` | 全部通过 |
| 6 | E2E测试 | `npx playwright test`（可选） | 全部通过 |

## 执行流程

```
1. 运行 npm run lint
   ├── 通过 → 继续
   └── 失败 → 报告错误，停止
2. 运行 npx tsc --noEmit
   ├── 通过 → 继续
   └── 失败 → 报告错误，停止
3. 运行 npx next build
   ├── 通过 → 继续
   └── 失败 → 报告错误，停止
4. 运行 npm test
   ├── 通过 → 继续
   └── 失败 → 报告错误，停止
5. 全部通过 → 执行部署
```

## 输出格式

```
🔍 Pre-deploy 检查

[1/4] Lint...         ✅ 0 errors
[2/4] TypeCheck...    ✅ 0 errors
[3/4] Build...        ✅ 46 pages
[4/4] Tests...        ✅ 79/79 passed

✅ 全部通过，开始部署
```

## 快速模式

当用户说"快速部署"时，只执行阶段 1+2（跳过测试），节省 ~60s。

## 部署后验证

部署完成后，自动：
1. webfetch 访问首页确认 200
2. 检查关键页面（/en/products, /en/blog, /en/contact）
3. 报告最终状态
