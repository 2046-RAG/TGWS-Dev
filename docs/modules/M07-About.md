# M07 - About 关于我们

> **状态**：80%（基于源码事实评估，详见 spec.md §7.7）— Wave 2 完成了 Sanity 迁移

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /about |
| 核心文件 | about/page.tsx (server component, 从 Sanity 获取内容) |
| 组件大小 | 6KB |
| PRD | [S14] 关于我们 |
| 完成度 | 80% |

## 页面内容

- **公司简介**：TechGuru Network & Data Solutions Inc.
- **发展历程**：时间轴（W2-5 迁移到 Sanity `timelineEvent` schema，年份去重）
- **团队介绍**：3 联合创始人 + 2 售前 + 5 销售 = 10 人（W2-5 迁移到 Sanity `teamMember` schema）
- **公司资质**：合作伙伴认证（W2-5 迁移到 Sanity `qualification` schema）

## Sanity Schemas（W2-5 新增）

| Schema | 字段 |
|--------|------|
| `teamMember.ts` | name, nameZh, role, roleZh, bio, bioZh, photo, order |
| `qualification.ts` | title, titleZh, description, descriptionZh, icon, order |
| `timelineEvent.ts` | year, month, title, titleZh, description, descriptionZh, order |

## 公司信息

- 成立：2023 年，菲律宾马尼拉
- 地址：10 Rajah Matanda St, corner JP Rizal St, Project 4, Quezon City
- 电话：+63 960 282 5051
- 邮箱：Inquiries@techguru-it.asia

## Wave 0-4 改动

| Wave | 改动 | 文件 |
|------|------|------|
| W0-3 | 删除 `about/layout.tsx`（metadata-only wrapper 死代码，依赖 W0-3 完成 sanity.config 清理） | about/ |
| W2-5 | 完善 `teamMember.ts` schema；新建 `qualification.ts`、`timelineEvent.ts` schema；在 `sanity.config.ts` 注册；`about/page.tsx` 改 server component 从 Sanity 获取 team/qualifications/timeline；时间线年份去重；创建 Sanity 内容 seed 脚本 `tgws/scripts/seed-about.mjs` | sanity/schemas/, about/page.tsx, scripts/seed-about.mjs |

## 已知问题

| # | 问题 | 状态 |
|---|------|------|
| 1 | Sanity 中文内容填充完整度未线上验证 | ⏳ 待 Playwright 截图验证 |
| 2 | 团队照片路径仍在 Sanity image 字段中（W2-5 修复后已正确） | ✅ 已修复 |

## 关键教训

1. **内容策略必须强制走 Sanity**：原 `about/page.tsx` 全部内容来自 `messages/{en,zh}.json`，违反 "全部内容走 Sanity 多语言字段" 规则；W2-5 已迁移
2. **stub 数据形状进了生产**：`timeline` 重复年份、`team`/`qualifications` 仅 icon/color 是明显的占位形状 → W2-5 已用 Sanity schema 替代
3. **硬编码资源路径无校验**：团队照片、图标颜色、时间线年份原在源码里，无 fallback、无校验、无资产清单 → W2-5 已迁移到 Sanity

## 相关 Session

- W2-5: About 页面迁移到 Sanity（2026-07-19）
