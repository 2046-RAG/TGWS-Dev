import { tool } from "@mimo-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default tool({
  description: "TGWS项目文案修改引导工具 - 扫描并识别可能需要修改的AI化文案，提供修改建议",
  args: {
    scan: tool.schema.boolean().describe("扫描所有文案并列出可能需要修改的项目").default(false),
    file: tool.schema.string().describe("指定要扫描的文件（en.json或zh.json）"),
    category: tool.schema.string().describe("按类别筛选：hero/home/products/solutions/blog/compare/all").default("all"),
  },
  async execute(args, ctx) {
    const projectRoot = ctx.directory
    const results: string[] = []
    
    // 确定要扫描的文件
    const filesToScan = args.file 
      ? [args.file]
      : ["tgws/src/messages/en.json", "tgws/src/messages/zh.json"]
    
    // AI化用词模式
    const aiPatterns = [
      "leverage", "empower", "transform", "seamless", "cutting-edge", 
      "innovative", "robust", "comprehensive", "end-to-end", "streamline",
      "optimize", "enhance", "facilitate", "utilize", "maximize", "minimize",
      "accelerate", "elevate", "amplify", "revolutionize", "paradigm",
      "synergy", "holistic", "scalable", "resilient", "agile", "dynamic",
      "proactive", "ecosystem", "智慧", "轉型", "無縫", "前沿", "創新",
      "穩健", "全面", "端到端", "優化", "增強", "促進", "利用", "最大化",
      "最小化", "加速", "提升", "擴大", "革新", "典範", "協同", "可擴展",
      "韌性", "敏捷", "動態", "主動", "生態系統", "現代化", "整合", "自動化"
    ]
    
    // 类别到文件路径的映射
    const categoryMap: Record<string, string[]> = {
      "hero": ["hero"],
      "home": ["home"],
      "products": ["products"],
      "solutions": ["solutions"],
      "blog": ["blog"],
      "compare": ["compare"],
      "all": ["hero", "home", "products", "solutions", "blog", "compare", "about", "contact", "auth", "footer", "privacy", "vmware"]
    }
    
    const targetCategories = categoryMap[args.category] || categoryMap["all"]
    
    for (const filePath of filesToScan) {
      try {
        const fullPath = path.join(projectRoot, filePath)
        if (!fs.existsSync(fullPath)) {
          results.push(`❌ 文件不存在: ${filePath}`)
          continue
        }
        
        const content = fs.readFileSync(fullPath, "utf8")
        const lines = content.split("\n")
        const fileName = path.basename(filePath)
        
        results.push(`\n## ${fileName} 文案扫描结果`)
        
        let foundItems = 0
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          
          // 检查是否包含AI化用词
          for (const pattern of aiPatterns) {
            if (line.toLowerCase().includes(pattern.toLowerCase())) {
              // 提取文案内容
              const match = line.match(/"([^"]+)":\s*"([^"]+)"/)
              if (match) {
                const [_, key, value] = match
                const lineNumber = i + 1
                
                // 检查是否属于目标类别
                const isTargetCategory = targetCategories.some(cat => 
                  key.toLowerCase().includes(cat.toLowerCase()) ||
                  line.toLowerCase().includes(cat.toLowerCase())
                )
                
                if (isTargetCategory) {
                  results.push(`- **${key}** (行${lineNumber}): "${value}"`)
                  results.push(`  - 问题: 包含"${pattern}"`)
                  foundItems++
                }
              }
              break
            }
          }
        }
        
        if (foundItems === 0) {
          results.push("✅ 未发现明显AI化文案")
        } else {
          results.push(`\n共发现 ${foundItems} 处可能需要修改的文案`)
        }
        
      } catch (error) {
        results.push(`❌ 读取${filePath}失败: ${error}`)
      }
    }
    
    // 添加使用建议
    results.push("\n## 使用建议")
    results.push("1. 使用此工具扫描文案后，可以选择具体项目进行修改")
    results.push("2. 修改文案时，请确保中英文版本同步更新")
    results.push("3. 核心品牌文案修改需要用户确认（AGENTS.md第47条）")
    results.push("4. 修改后建议运行npm run build验证编译")
    
    return results.join("\n")
  },
})