# M04 - Solutions 行业解决方案

## 模块概览

| 项目 | 内容 |
|------|------|
| 路由 | /solutions |
| 核心文件 | SolutionsList.tsx (10KB) |
| 组件大小 | 12KB |
| PRD | [S10] 行业解决方案 |
| 状态 | ✅ 完成 |

## Sanity数据

- 17个解决方案
- Schema已扩充: solutions/metricLabel + zh变体

## 功能特性

- **Sanity优先+i18n fallback**: 数据优先从Sanity获取，无数据时用i18n
- **6个行业Tab**: healthcare, finance, retail, logistics, education, government

## 关键教训

1. **SolutionsList已Sanity优先**: 原组件100%用i18n，重写后Sanity数据优先
2. **Schema扩充**: 新增solutions(string[] Build/Run/Protect)、metricLabel字段
3. **迁移脚本待执行**: migrate-solutions.mjs已创建，需网络可用时运行

## 相关Session

- S54: Solutions切换Sanity数据源(#8)完成
