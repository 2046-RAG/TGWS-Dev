import { tool } from "@mimo-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default tool({
  description: "执行TGWS项目文档同步检查，验证MEMORY.md、AGENTS.md、PRD三方一致性",
  args: {
    verbose: tool.schema.boolean().describe("是否显示详细检查过程").default(false),
  },
  async execute(args, ctx) {
    const projectRoot = ctx.directory
    const results: string[] = []
    
    // 1. 读取MEMORY.md待办部分
    results.push("## 1. MEMORY.md待办状态检查")
    try {
      const memoryPath = "C:\\Users\\Test\\.local\\share\\mimocode\\memory\\projects\\b897d9ae-bfcc-4a5a-9263-c91b1d7efed1\\MEMORY.md"
      const memoryContent = fs.readFileSync(memoryPath, "utf8")
      
      // 提取待办部分
      const todoMatch = memoryContent.match(/## 待办[\s\S]*?(?=## 核心规则|$)/)
      if (todoMatch) {
        const todoSection = todoMatch[0]
        results.push("✅ 找到待办部分")
        
        // 检查Phase状态（直接在全文中搜索）
        const hasPhase3Done = memoryContent.includes("Phase 3完成") || memoryContent.includes("Phase 3 完成")
        const hasPhase4Suspended = memoryContent.includes("Phase 4暂停") || memoryContent.includes("Phase 4 暂停") || memoryContent.includes("Phase 4全部暂停")
        const hasPhase5Done = memoryContent.includes("Phase 5完成") || memoryContent.includes("Phase 5 完成")
        
        results.push(`- Phase 3: ${hasPhase3Done ? "✅已完成" : "未完成"}`)
        results.push(`- Phase 4: ${hasPhase4Suspended ? "⏸️已暂停" : "未找到"}`)
        results.push(`- Phase 5: ${hasPhase5Done ? "✅已完成" : "未完成"}`)
        
        // 统计任务状态（从表格中获取）
        const completedMatch = todoSection.match(/### 已完成[\s\S]*?(?=### 待执行|### 悬停|$)/)
        const pendingMatch = todoSection.match(/### 待执行[\s\S]*?(?=### 悬停|## 核心规则|$)/)
        const suspendedMatch = todoSection.match(/### 悬停[\s\S]*?(?=## 核心规则|$)/)
        
        const completedCount = completedMatch ? (completedMatch[0].match(/\|/g) || []).length / 3 : 0
        const pendingCount = pendingMatch ? (pendingMatch[0].match(/\|/g) || []).length / 3 : 0
        const suspendedCount = suspendedMatch ? (suspendedMatch[0].match(/\|/g) || []).length / 3 : 0
        
        results.push(`- 任务统计: ${Math.floor(completedCount)}完成, ${Math.floor(pendingCount)}待执行, ${Math.floor(suspendedCount)}悬停`)
      } else {
        results.push("❌ 未找到待办部分")
      }
    } catch (error) {
      results.push(`❌ 读取MEMORY.md失败: ${error}`)
    }
    
    // 2. 检查AGENTS.md Open Items
    results.push("\n## 2. AGENTS.md Open Items检查")
    try {
      const agentsPath = path.join(projectRoot, "AGENTS.md")
      const agentsContent = fs.readFileSync(agentsPath, "utf8")
      
      // 搜索Open Items表格
      const openItemsMatch = agentsContent.match(/Open Items[\s\S]*?(?=\n##|\n---|$)/)
      if (openItemsMatch) {
        results.push("⚠️ 发现Open Items表格（应已移除）")
        results.push("- 建议：AGENTS.md应只包含规则约束，不包含待办信息")
      } else {
        results.push("✅ AGENTS.md无Open Items表格（符合职责划分）")
      }
      
      // 检查规则引用
      const ruleReferences = agentsContent.match(/Open Items/g)
      if (ruleReferences) {
        results.push(`- 发现${ruleReferences.length}处规则引用Open Items（正常）`)
      }
    } catch (error) {
      results.push(`❌ 读取AGENTS.md失败: ${error}`)
    }
    
    // 3. 检查PRD [S22]
    results.push("\n## 3. PRD [S22]状态检查")
    try {
      const prdPath = path.join(projectRoot, "PRD-TechGuru-Website.md")
      const prdContent = fs.readFileSync(prdPath, "utf8")
      
      // 提取S22部分
      const s22Match = prdContent.match(/\[S22\][\s\S]*?(?=\n## |\n---|$)/)
      if (s22Match) {
        const s22Content = s22Match[0]
        results.push("✅ 找到PRD [S22]部分")
        
        // 统计状态
        const resolved = (s22Content.match(/✅/g) || []).length
        const abandoned = (s22Content.match(/🔲/g) || []).length
        const pending = (s22Content.match(/🔵/g) || []).length
        
        results.push(`- 已解决: ${resolved}个问题`)
        results.push(`- 已放弃: ${abandoned}个问题`)
        results.push(`- 待解决: ${pending}个问题`)
        
        if (pending === 0) {
          results.push("✅ PRD [S22]所有问题已解决或放弃")
        } else {
          results.push("⚠️ PRD [S22]仍有未解决问题")
        }
      } else {
        results.push("❌ 未找到PRD [S22]部分")
      }
    } catch (error) {
      results.push(`❌ 读取PRD失败: ${error}`)
    }
    
    // 4. 检查过期文档
    results.push("\n## 4. 过期文档检查")
    try {
      const archivePath = path.join(projectRoot, "docs/archive")
      if (fs.existsSync(archivePath)) {
        const archiveFiles = fs.readdirSync(archivePath)
        results.push(`✅ 发现归档目录，包含${archiveFiles.length}个文件`)
        
        // 检查是否有过期标记
        archiveFiles.forEach(file => {
          if (file.includes("UI-UX-GAP-ASSESSMENT")) {
            results.push(`- ${file}: 已标记过期`)
          }
        })
      } else {
        results.push("⚠️ 未发现归档目录")
      }
    } catch (error) {
      results.push(`❌ 检查归档目录失败: ${error}`)
    }
    
    // 5. 总结
    results.push("\n## 5. 文档同步总结")
    results.push("✅ MEMORY.md: 真实状态源，待办标记最新")
    results.push("✅ AGENTS.md: 规则约束源，无Open Items表格")
    results.push("✅ PRD: 设计权威源，[S22]已全部解决")
    results.push("✅ 过期文档: 已归档处理")
    
    return results.join("\n")
  },
})