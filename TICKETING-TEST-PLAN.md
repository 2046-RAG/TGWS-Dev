# 工单模块端到端测试驱动与验收标准

**版本**: v2.0
**日期**: 2026-07-02
**原则**: 模拟真实用户从第一个点击到最后一个验证的完整闭环

---

## 〇、约束声明

- **Playwright仅允许Edge浏览器**，禁止Chrome/Chromium（AGENTS.md #27）
- 所有测试必须在生产环境(https://tgws.vercel.app)或本地dev服务器上实际运行
- 代码分析不能替代实际浏览器验证

---

## 一、测试驱动：完整用户旅程

以下按**时间线顺序**模拟一个真实用户从注册到关闭工单的全部操作。每个步骤标注：操作→预期结果→验证方式。

---

### 旅程A：新客户注册账号

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
A1    打开浏览器，访问 /en/support       显示登录引导页，有 "Sign In" 和 "Create Account" 两个按钮
A2    点击 "Create Account"              跳转到 /en/support/register
A3    观察注册表单                       4个字段: Full Name / Email / Password / Confirm Password
                                        密码提示: "Min 8 chars, uppercase, lowercase, numbers"
A4    只填Name和Email，点击注册           表单验证拦截，Password字段显示必填提示
A5    密码输入 "123" (少于8位)           显示密码长度不足提示
A6    密码输入 "password" (无大写无数字)  显示密码格式不符合要求
A7    密码="Abcdef1@"  确认密码="Abcdef1@ 通过
A8    密码="Abcdef1@"  确认密码="Abcdef2@" 点击注册  显示 "Passwords do not match"
A9    密码="Abcdef1@"  确认密码="Abcdef1@" 填写Name="Test User" Email="test@example.com"
A10   点击 "Create Account"              按钮显示loading "Creating account..."
A11   等待响应                           自动登录，跳转到 /en/support Dashboard
A12   验证Dashboard                      显示 "Welcome back, Test"，工单统计全部为0
```

**验收标准**:
- [ ] A3: 表单4个字段均有label和placeholder
- [ ] A3: 密码输入框type="password"，有autocomplete="new-password"
- [ ] A5/A6/A8: 错误消息在对应字段旁内联显示（非顶部banner）
- [ ] A10: 提交按钮在请求中显示spinner并禁用
- [ ] A11: 跳转后URL为 /en/support（不是英语版的裸路径）
- [ ] A12: Dashboard有3个Tab: Dashboard / New Ticket / My Tickets

---

### 旅程B：忘记密码 → 重置密码 → 登录失败 → 重新登录

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
B1    在Support页点击 "Sign Out"         登出，跳转到 /en/support/login
B2    在登录页点击 "Forgot password?"    表单切换为密码重置模式（隐藏密码输入框）
B3    观察界面                           显示 "Reset Password" 标题 + 邮箱输入 + "Send Reset Link" 按钮
B4    点击 "Back to Sign In"            切回正常登录模式
B5    再次点击 "Forgot password?"        切回重置模式
B6    不输入邮箱直接点 "Send Reset Link"  表单验证拦截（email required）
B7    输入注册邮箱 "test@example.com"     点击发送
B8    等待响应                           显示 "Password reset email sent. Check your inbox."
B9    点击 "Back to Sign In"            回到登录模式
B10   输入正确邮箱 + 错误密码            点击登录 → 显示错误 "Invalid login credentials"
B11   输入正确邮箱 + 正确密码            点击登录 → loading "Signing in..." → 跳转Dashboard
```

**验收标准**:
- [ ] B2: 重置模式隐藏密码框，只显示邮箱
- [ ] B3: 重置按钮文案为 "Send Reset Link"（不是 "Sign In"）
- [ ] B8: 成功消息为绿色，失败消息为红色
- [ ] B10: 错误消息不泄露"该邮箱是否存在"（统一提示）
- [ ] B11: 登录成功后URL包含locale前缀

---

### 旅程C：完整提单流程（核心闭环）

**前置**: 用户已登录，在Dashboard

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
C1    在Dashboard点击 "Submit New Ticket"  切换到New Ticket标签，显示工单表单
C2    观察表单结构                       字段依次为:
                                        - Category (下拉选择: Build/Run/Protect)
                                        - Product/Service (下拉选择或输入，列出已知产品)
                                        - Problem Occurrence Time (日期时间选择器，精确到分钟)
                                        - Subject (单行输入)
                                        - Description (多行文本，有字数统计)
                                        - Screenshots (粘贴区域 + 点击上传)
                                        - Attachments (文件上传区)
C3    不填任何字段，直接点Submit          所有必填字段显示验证提示
C4    选择Category: "Protect"            下拉展开，显示3个选项带品牌色标签
C5    选择Product: "Fortinet NGFW"       从产品列表中选择（或手动输入）
C6    设置问题发生时间                    日期时间选择器:
                                        - 日期: 今天
                                        - 时间: 14:30 (精确到分钟)
                                        - 验证: 显示 "Jul 2, 2026 14:30"
C7    填写Subject: "Firewall blocking VPN traffic"  输入正常
C8    填写Description                    输入超过800字 → 字数统计变红，显示 "800/800"
                                        超出部分被截断或禁止输入
C9    粘贴截图 (Ctrl+V)                  截图出现在预览区，可删除
C10   点击附件上传区                     系统文件选择器弹出
C11   选择一个50MB的zip文件              上传成功（无格式限制，只有大小限制）
C12   选择一个200MB的文件                显示 "File too large (max 50MB)" 或类似提示
C13   查看表单底部                       显示已选附件列表，每个可单独删除
C14   点击 "Submit Ticket"              按钮显示 "Submitting..." + spinner
C15   等待创建完成                       先创建工单 → 再逐个上传附件
C16   查看成功状态                       绿色卡片: "Ticket Submitted!"
                                        显示工单号 TG-YYYYMMDD-XXXX
                                        显示附件数量和文件名
C17   点击 "My Tickets"                 刚创建的工单出现在列表顶部
C18   验证工单卡片信息                   分类标签=Protect(绿色)
                                        状态=Open(黄色)
                                        时间=刚刚
```

**验收标准（按字段逐一）**:

**Category字段**:
- [ ] 下拉选择，3个选项: Build / Run / Protect
- [ ] 每个选项带对应品牌色 (Build=#00D4FF, Run=#7B61FF, Protect=#22C55E)
- [ ] 必填，未选时提交验证拦截

**Product/Service字段**:
- [ ] 支持下拉选择预设产品（从Sanity产品列表）
- [ ] 也支持手动输入自定义产品名
- [ ] 必填

**Problem Occurrence Time**:
- [ ] 日期时间选择器，精确到分钟
- [ ] 默认值: 当前时间
- [ ] 可选择过去的时间（不能选未来）
- [ ] 显示格式: "YYYY-MM-DD HH:mm"
- [ ] 必填

**Subject**:
- [ ] 单行文本输入
- [ ] 最大200字符（与数据库约束一致）
- [ ] 必填
- [ ] placeholder提示: "Brief description of your issue"

**Description**:
- [ ] 多行文本区域
- [ ] **最大800字符**
- [ ] 右下角显示字数统计: "当前字数/800"
- [ ] 超过800字时统计变红 + 禁止继续输入
- [ ] 必填
- [ ] placeholder: "Detailed description of your issue..."

**Screenshots (粘贴区)**:
- [ ] 支持Ctrl+V / Cmd+V直接粘贴剪贴板图片
- [ ] 粘贴后立即显示缩略图预览
- [ ] 每张截图可单独删除（X按钮）
- [ ] 粘贴区有虚线边框 + 提示 "Paste screenshot here (Ctrl+V)"
- [ ] 也可点击粘贴区触发文件选择器
- [ ] 图片格式: jpg/png/gif/webp

**Attachments (文件上传)**:
- [ ] 支持任意格式文件（不限制扩展名）
- [ ] 单文件最大50MB
- [ ] 支持多文件同时上传
- [ ] 上传区显示已选文件列表
- [ ] 每个文件可单独删除
- [ ] 显示文件名 + 大小

**提交流程**:
- [ ] 先POST创建工单(JSON) → 获取ticketId
- [ ] 再逐个上传附件(FormData, 带ticketId)
- [ ] 上传过程中显示 "Uploading files..."
- [ ] 全部完成后显示成功状态
- [ ] 成功后清除auto-save草稿
- [ ] 成功卡片显示工单号 + 附件列表

---

### 旅程D：查看工单列表与状态

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
D1    点击 "My Tickets"                  显示工单列表
D2    查看工单卡片                       工单号 / 分类标签 / 主题 / 创建时间 / 状态标签
D3    按时间排序                         最新创建的在最上面
D4    创建第二个工单                     列表显示2个工单
D5    切换到中文 /zh/support             工单列表仍然显示，UI文案变中文
D6    点击 "我的工单"                    显示相同的工单数据
D7    切回英文 /en/support               数据不丢失
```

**验收标准**:
- [ ] 工单列表只显示当前用户的工单（RLS隔离）
- [ ] 空状态: 显示图标 + "No tickets yet" + 引导文案
- [ ] 工单号使用等宽字体
- [ ] 分类标签颜色正确
- [ ] 状态标签: Open(黄) / In Progress(蓝) / Resolved(绿) / Closed(灰)
- [ ] 日期格式: "MMM d, yyyy HH:mm"
- [ ] hover效果: 卡片上浮 + 阴影
- [ ] i18n切换不丢失数据

---

### 旅程E：管理员处理工单

**前置**: 用管理员账号 Syed.Ong@techguru-it.asia 登录

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
E1    管理员登录                          Dashboard显示所有用户的工单统计
E2    查看工单列表                        能看到所有customer提交的工单
E3    选择一个Open状态的工单              点击进入详情
E4    更新状态: Open → In Progress        状态标签立即变为蓝色
E5    分配给团队成员                      assigned_to字段更新
E6    更新状态: In Progress → Resolved    状态标签变绿色，resolved_at自动设置
E7    查看审计日志                        显示3条记录:
                                         - created by customer
                                         - status_changed by admin
                                         - assigned by admin
E8    用customer账号登录                  只能看到自己的工单
E9    customer尝试更新别人的工单           API返回403 Forbidden
```

**验收标准**:
- [ ] admin Dashboard统计为全局数据
- [ ] admin可查看/更新所有工单
- [ ] 分配工单时状态自动从Open变为In Progress
- [ ] 每次操作记录审计日志(who/when/what)
- [ ] 乐观锁: version字段防止并发覆盖
- [ ] customer无法访问/修改其他用户的工单

---

### 旅程F：移动端完整操作

```
步骤  用户操作                          预期结果
──────────────────────────────────────────────────────────────
F1    手机(375px)访问 /en/support        侧边栏隐藏，显示顶部导航栏
F2    Tab导航可横向滚动                   Dashboard / New Ticket / My Tickets
F3    点击 New Ticket                    表单全宽显示
F4    填写所有字段                        触摸键盘正常弹出，字段不被遮挡
F5    粘贴截图                           手机端支持长按粘贴
F6    选择附件                           调起系统文件选择器
F7    提交工单                           成功状态正常显示
F8    查看工单列表                        列表项全宽，触摸目标>=44px
```

**验收标准**:
- [ ] 768px以下: 侧边栏→顶部栏，Tab可横滚
- [ ] 表单字段移动端全宽
- [ ] 触摸目标最小44px x 44px
- [ ] 日期选择器在移动端可用
- [ ] 文件选择器调起系统界面

---

## 二、与现有代码的差距（需先改代码）

| # | 功能需求 | 当前状态 | 需要改动 |
|---|----------|----------|----------|
| 1 | Product下拉选择 | 自由文本输入 | 改为从Sanity拉取产品列表的下拉框 |
| 2 | 问题发生时间(精确到分钟) | 不存在 | 新增datetime-local输入字段 |
| 3 | Description 800字限制 | 无限制 | 添加maxLength=800 + 字数统计 |
| 4 | 粘贴截图 | 不存在 | 添加onPaste事件处理 + 剪贴板图片读取 |
| 5 | 附件不限格式 | 白名单限制(pdf/doc) | 移除accept限制，只保留大小限制 |
| 6 | 附件大小50MB | 10MB | 修改MAX_SIZE常量 |
| 7 | 字数统计UI | 不存在 | 添加实时字数统计显示 |

**结论**: 现有代码需要**先做功能改造**，才能写对应测试。否则测试的是旧功能，不是你要的。

---

## 三、Playwright全局约束

```
✅ 允许: Microsoft Edge
❌ 禁止: Chrome / Chromium
❌ 禁止: 安装Chromium二进制文件

配置示例:
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
```

已在 AGENTS.md #27 和项目MEMORY.md 中记录。

---

## 四、实施建议

### 建议执行顺序

**Step 1 — 改造TicketForm组件**
先实现上述7项功能改造（产品下拉、时间选择、字数限制、粘贴截图、附件格式放开、大小限制调整、字数统计UI）。

**Step 2 — 写测试**
按旅程A→F的顺序，每个步骤写一个Playwright测试断言。

**Step 3 — 运行验收**
在本地dev或生产环境实际跑通全部旅程。

### 测试文件结构

```
e2e/
├── journey-a-register.spec.ts       # 旅程A: 注册
├── journey-b-auth.spec.ts           # 旅程B: 认证(忘记密码/登录失败/重置)
├── journey-c-submit-ticket.spec.ts  # 旅程C: 完整提单(核心)
├── journey-d-ticket-list.spec.ts    # 旅程D: 工单列表
├── journey-e-admin.spec.ts          # 旅程E: 管理员操作
├── journey-f-mobile.spec.ts         # 旅程F: 移动端
└── playwright.edge.config.ts        # Edge专用配置
```

---

**报告生成**: 2026-07-02
**待审批**: 先改代码还是先写测试？
