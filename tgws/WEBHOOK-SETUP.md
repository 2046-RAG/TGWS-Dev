# Sanity Webhook 一键配置指南

## 快速配置步骤

### 1. 打开Sanity管理后台

点击链接：https://www.sanity.io/manage/personal/project/r6ztl1oq/api/webhooks

### 2. 创建Webhook

点击 **Create webhook** 按钮

### 3. 复制以下配置

**Name:**
```
Next.js Revalidation
```

**URL:**
```
https://www.techguru-it.asia/api/revalidate
```

**HTTP Method:**
```
POST
```

**Triggers:**
- ✅ Create
- ✅ Update
- ✅ Delete

**Filter:**
```
_type in ["timelineEvent", "teamMember", "qualification", "product", "solution", "post", "partner", "faq"]
```

**HTTP Headers:**

| Key | Value |
|-----|-------|
| `x-revalidate-secret` | `e14ce044caced168317a82b95dcfa2e4457226f2a7b0d87c5387d4169eef2495` |

### 4. 保存

点击 **Save** 按钮

---

## 验证配置

配置完成后，更新Sanity中的任何数据，前端会在**几秒内**自动同步显示新内容。

### 测试方法

1. 访问 https://www.techguru-it.asia/en/about
2. 在Sanity后台修改团队成员的bio
3. 刷新页面，查看是否显示新内容

---

## 已配置的Revalidation Secret

```
e14ce044caced168317a82b95dcfa2e4457226f2a7b0d87c5387d4169eef2495
```

此secret已配置在Vercel环境变量中。