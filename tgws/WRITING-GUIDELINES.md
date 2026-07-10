# Blog写作规范

## 1. 核心原则

**像真人写的技术博客，不像AI生成的内容。**

---

## 2. 去AI化写作规范

### 2.1 标题

| ❌ AI写法 | ✅ 真人写法 |
|----------|------------|
| "VMware SRM Disaster Recovery: A Comprehensive Guide" | "How We Design VMware SRM DR for Philippine Enterprises" |
| "The Complete Guide to HCI Deployment" | "HCI Deployment: Lessons from 50+ Enterprise Projects" |
| "Understanding Zero Trust Architecture" | "Zero Trust: What Actually Works in 2025" |

**规则：**
- 用"How We..."、"Lessons from..."、"What Actually Works..."等开头
- 避免"A Comprehensive Guide"、"The Complete Guide"等套话
- 包含具体场景或数据

### 2.2 开头

| ❌ AI写法 | ✅ 真人写法 |
|----------|------------|
| "In today's rapidly evolving IT landscape..." | "Last month, a healthcare client called us at 2am because..." |
| "As technology continues to advance..." | "We've deployed over 50 HCI clusters in the past year. Here's what we learned." |
| "In the modern enterprise environment..." | "If you're still running VMware 6.5, this article is for you." |

**规则：**
- 用具体场景、故事、数据开头
- 避免"In today's..."、"As technology..."等套话
- 第一句话就要抓住读者

### 2.3 技术描述

| ❌ AI写法 | ✅ 真人写法 |
|----------|------------|
| "This solution provides optimal performance" | "We saw 40% faster failover after implementing this" |
| "The architecture is designed for scalability" | "We've scaled this from 10 to 500 VMs without issues" |
| "This approach is widely adopted in the industry" | "Fortinet and Palo Alto both use this pattern" |

**规则：**
- 用具体数据和案例
- 避免"optimal"、"scalable"、"widely adopted"等空洞词
- 说人话，不要说"企业级解决方案"

### 2.4 结论

| ❌ AI写法 | ✅ 真人写法 |
|----------|------------|
| "In conclusion, this is a valuable solution" | "If you're running VMware and haven't tested DR lately, now's the time" |
| "To summarize, HCI offers many benefits" | "Next step: run a PoC with your most critical workload" |
| "In summary, Zero Trust is the future" | "Start with MFA. That's 80% of the battle." |

**规则：**
- 给出具体的下一步行动
- 避免"In conclusion"、"To summarize"等套话
- 让读者知道该做什么

### 2.5 过渡句

| ❌ AI写法 | ✅ 真人写法 |
|----------|------------|
| "Furthermore, it is important to note that..." | "Plus, there's another benefit..." |
| "Moreover, this solution also..." | "But here's the thing most people miss..." |
| "Additionally, we should consider..." | "One more thing before we move on..." |

**规则：**
- 用口语化过渡
- 避免"Furthermore"、"Moreover"、"Additionally"等正式连接词
- 像在和同事聊天

---

## 3. 语言一致性检查

### 3.1 英文文章

**允许：**
- 技术术语：VMware, FortiGate, Sangfor, Nutanix, HCI, SD-WAN等
- 缩写：API, SDK, HTTP, REST, SQL等
- 代码片段
- 人名、公司名

**禁止：**
- 中文字符
- 中文标点（，。；：）
- 中文句子

**检查方法：**
```bash
# 检查是否有中文字符（排除技术术语）
grep -P '[\x{4e00}-\x{9fff}]' article-en.md
```

### 3.2 中文文章

**允许：**
- 技术术语：VMware, FortiGate, Sangfor, Nutanix, HCI, SD-WAN等
- 缩写：API, SDK, HTTP, REST, SQL等
- 代码片段
- 人名、公司名

**禁止：**
- 英文句子（连续10个以上英文字符）
- 英文标点（,. ;: 等）
- 英文段落

**检查方法：**
```bash
# 检查是否有英文句子
grep -P '[A-Za-z]{10,}' article-zh.md
```

---

## 4. 内容审核清单

每篇文章发布前必须检查：

| 检查项 | 通过标准 | 状态 |
|--------|----------|------|
| 开头有具体场景/故事 | 有真实场景引入 | [ ] |
| 有个人观点/经验 | 有作者视角 | [ ] |
| 有具体数据/案例 | 有量化指标 | [ ] |
| 无套话（首先/其次/最后） | 无套话 | [ ] |
| 无正式连接词（Furthermore/Moreover） | 无正式连接词 | [ ] |
| 无空洞形容词（非常重要等） | 无空洞词 | [ ] |
| 结尾有行动建议 | 有具体下一步 | [ ] |
| 语言一致性 | 英文无中文，中文无英文 | [ ] |
| 技术准确性 | 技术描述正确 | [ ] |
| 标题吸引人 | 符合标题规范 | [ ] |

---

## 5. 写作模板

### 5.1 标题模板

```
[How/Lessons/What] + [具体场景] + [for/in/at] + [目标受众/行业]
```

**示例：**
- "How We Deploy VMware SRM for Philippine Healthcare"
- "Lessons from 50+ HCI Deployments in Asia"
- "What Actually Works in Enterprise Zero Trust"

### 5.2 开头模板

```
[具体时间/场景] + [发生了什么] + [引出文章主题]
```

**示例：**
- "Last month, a healthcare client called us at 2am because their primary site went down..."
- "We've deployed over 50 HCI clusters in the past year. Here's what we learned."
- "If you're still running VMware 6.5, this article is for you."

### 5.3 结构模板

```
# [标题]

[开头：具体场景/故事]

## What is [Topic]?
[简单定义，1-2段]

## Why [Topic] Matters?
[重要性，用数据说话]

## How to [Implement/Design]?
[具体步骤，带代码/配置示例]

## Best Practices
[最佳实践列表]

## Common Mistakes
[常见错误和避免方法]

## Conclusion
[总结 + 行动建议]

## FAQ
[3-5个常见问题]
```

---

## 6. 示例对比

### 6.1 差的示例（AI味道重）

```markdown
# VMware SRM Disaster Recovery: A Comprehensive Guide

In today's rapidly evolving IT landscape, disaster recovery has become 
increasingly important for enterprises. VMware Site Recovery Manager (SRM) 
is a comprehensive solution that provides automated disaster recovery 
capabilities.

Furthermore, SRM offers optimal performance and scalability. Additionally, 
it is widely adopted in the industry. Moreover, this solution is designed 
for enterprise environments.

In conclusion, VMware SRM is a valuable solution for disaster recovery. 
To summarize, organizations should consider implementing SRM to protect 
their critical workloads.
```

### 6.2 好的示例（真人写法）

```markdown
# How We Design VMware SRM DR for Philippine Healthcare

Last month, a healthcare client called us at 2am because their primary 
data center lost power. Their EHR system was down, and patients were 
waiting. Thanks to VMware SRM, we failed over to the DR site in 
12 minutes. Here's how we set it up.

## What is VMware SRM?

VMware SRM is essentially a "panic button" for your virtual 
infrastructure. When your primary site goes down, it automatically 
fails over to your DR site. No manual intervention needed.

## Why Healthcare Needs DR

In healthcare, downtime isn't just expensive—it's dangerous. We've 
seen hospitals lose $50,000 per hour during outages. SRM reduces 
that risk by 90% in our experience.

## How We Deploy SRM

Here's our 5-step process:

1. **Assess RPO/RTO requirements** - Healthcare typically needs 
   RPO < 15 minutes, RTO < 1 hour
2. **Configure replication** - We use async replication for most 
   workloads, sync for critical databases
3. **Test failover** - We run monthly tests (yes, monthly)
4. **Document runbooks** - Step-by-step guide for the IT team
5. **Train staff** - The IT team needs to know how to trigger failover

## Common Mistakes

**Mistake 1: Not testing regularly**
We've seen clients set up SRM and never test it. Then when disaster 
strikes, they discover the configuration is wrong.

**Mistake 2: Ignoring network failover**
SRM handles VM failover, but what about DNS? Load balancers? 
Firewall rules? You need to plan for all of it.

## Conclusion

If you're running VMware and haven't tested DR lately, now's the time. 
Start with your most critical workload. Run a failover test. You'll 
sleep better at night.

## FAQ

**Q: How long does failover take?**
A: Typically 5-15 minutes, depending on the workload and network.

**Q: Do we need a separate DR site?**
A: Yes, ideally in a different physical location. Cloud DR is also 
an option.
```

---

## 7. 检查工具

### 7.1 语法检查

- 不安装新依赖
- 使用浏览器插件或在线工具
- 重点检查：拼写、语法、标点

### 7.2 可读性检查

- 目标：Flesch-Kincaid分数 > 60
- 方法：人工判断
  - 句子是否简短？
  - 用词是否口语化？
  - 段落是否清晰？

### 7.3 语言一致性检查

- 英文文章：无中文字符
- 中文文章：无英文句子
- 技术术语除外

---

## 8. 附录：常见AI套话替换表

| AI套话 | 替换为 |
|--------|--------|
| Furthermore | Plus, Also, And |
| Moreover | But here's the thing, The thing is |
| Additionally | One more thing, Also |
| In conclusion | So, Here's the bottom line |
| To summarize | Bottom line, The short version |
| It is important to note that | Note that, Keep in mind |
| This solution provides | This gives you, This delivers |
| Optimal performance | Fast, Efficient, Better |
| Scalable | Grows with you, Handles more |
| Enterprise-grade | Production-ready, Battle-tested |
| Cutting-edge | Latest, New, Modern |
| Seamless integration | Works with, Connects to |
| Robust security | Secure, Protected |
| Comprehensive solution | Complete package, Everything you need |
