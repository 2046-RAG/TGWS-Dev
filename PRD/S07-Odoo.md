# TechGuru PRD - Odoo CRM集成

> 从 PRD-TechGuru-Website.md 分割
> 原始章节: L408-L431

---

## [S7] Odoo CRM集成

### 7.1 集成方式

表单单向推送到Odoo CRM，并在CRM中创建对应的Leads。

### 7.2 推送字段

| 网站字段 | Odoo字段 |
|----------|----------|
| 姓名 | Contact Name |
| 邮箱 | Email |
| 公司 | Company |
| 电话 | Phone |
| 需求描述 | Lead Description |
| 来源 | Lead Source = "TechGuru Website" |

### 7.3 技术实现

- 使用Odoo Online XML-RPC API
- 表单提交触发 → 调用Odoo API → 创建Contact + Lead

---


---