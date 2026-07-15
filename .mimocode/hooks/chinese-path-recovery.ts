import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join, resolve } from "path"

// Known skill locations (builtin + project)
const SKILL_DIRS = [
  "C:/Users/Test/.local/share/mimocode/builtin_skills/0.1.5/skills",
  "C:/Users/Test/.claude/skills",
  "C:/Users/Test/.agents/skills",
]

// Find a SKILL.md by name across known directories
function findSkillFile(name: string): string | null {
  for (const dir of SKILL_DIRS) {
    if (!existsSync(dir)) continue
    // Check direct path: dir/name/SKILL.md
    const direct = join(dir, name, "SKILL.md")
    if (existsSync(direct)) return direct
    // Check flat: dir/name.md
    const flat = join(dir, `${name}.md`)
    if (existsSync(flat)) return flat
    // Search one level deep
    try {
      const entries = readdirSync(dir)
      for (const entry of entries) {
        const entryPath = join(dir, entry)
        if (statSync(entryPath).isDirectory()) {
          const skillFile = join(entryPath, "SKILL.md")
          if (existsSync(skillFile)) {
            const content = readFileSync(skillFile, "utf-8")
            // Check if name matches frontmatter
            const nameMatch = content.match(/^name:\s*(.+)$/m)
            if (nameMatch && nameMatch[1].trim() === name) {
              return skillFile
            }
          }
        }
      }
    } catch {}
  }
  return null
}

// Glob fallback using PowerShell
function globFallback(pattern: string): string[] {
  try {
    const { execSync } = require("child_process")
    // Convert glob pattern to PowerShell-friendly format
    const psPattern = pattern.replace(/\*\*/g, "*").replace(/\*/g, "*")
    const result = execSync(
      `Get-ChildItem -Path "${psPattern}" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName`,
      { encoding: "utf-8", timeout: 15000 }
    )
    return result.split("\n").filter((l: string) => l.trim())
  } catch {
    return []
  }
}

export default {
  "tool.execute.after": async (input: any, output: any) => {
    // Recover from skill tool failures (Chinese path issue with ripgrep)
    if (input.tool === "skill" && output.error) {
      const skillName = input.args?.name
      if (skillName) {
        const skillFile = findSkillFile(skillName)
        if (skillFile) {
          try {
            const content = readFileSync(skillFile, "utf-8")
            output.error = undefined
            output.result = `<skill_content name="${skillName}">\n${content}\n</skill_content>`
            output.recovered = true
          } catch {}
        }
      }
    }

    // Recover from glob tool failures (Chinese path issue)
    if (input.tool === "glob" && output.error && output.error.includes("ripgrep")) {
      const pattern = input.args?.pattern
      if (pattern) {
        const files = globFallback(pattern)
        output.error = undefined
        output.result = files
        output.recovered = true
      }
    }
  },
}
