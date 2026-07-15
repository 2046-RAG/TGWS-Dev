import { tool } from "@mimo-ai/plugin"
import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

const SKILL_DIRS = [
  "C:/Users/Test/.local/share/mimocode/builtin_skills/0.1.5/skills",
  "C:/Users/Test/.claude/skills",
  "C:/Users/Test/.agents/skills",
  "D:/软件集/Mimo/WorkSpace/TGWS/.mimocode/skills",
]

function findSkillFile(name: string): { path: string; content: string } | null {
  for (const dir of SKILL_DIRS) {
    if (!existsSync(dir)) continue
    try {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        const entryPath = join(dir, entry)
        if (statSync(entryPath).isDirectory()) {
          const skillFile = join(entryPath, "SKILL.md")
          if (existsSync(skillFile)) {
            const content = readFileSync(skillFile, "utf-8")
            const nameMatch = content.match(/^name:\s*(.+)$/m)
            if (nameMatch && nameMatch[1].trim() === name) {
              return { path: skillFile, content }
            }
          }
        }
      }
    } catch {}
  }
  return null
}

export default tool({
  description:
    "Load a skill by name directly from the filesystem, bypassing the built-in skill tool's ripgrep dependency. Use when the skill tool fails with Chinese path errors.",
  args: {
    name: tool.schema.string().describe("Skill name to load"),
  },
  async execute(args, ctx) {
    const result = findSkillFile(args.name)
    if (!result) {
      return `Skill "${args.name}" not found in any known directory.`
    }
    return `<skill_content name="${args.name}" path="${result.path}">\n${result.content}\n</skill_content>`
  },
})
