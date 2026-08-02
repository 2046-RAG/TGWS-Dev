/**
 * enforce-design-compliance hook
 * 
 * 在每次 edit/write 工具调用后，检查当前文件是否涉及已知的设计关键模块。
 * 如果涉及，提醒 agent 对照设计规范验证实现。
 * 
 * 触发场景：之前的问题是 AI摘要生成时直接透传 Tavily 答案，
 * 跳过了"融合 CSE + Tavily + 站内结果"的设计要求。
 */
export default {
  "tool.execute.after": async (input, output) => {
    // 只检查代码编辑操作
    if (input.tool !== 'edit' && input.tool !== 'write') return;

    const filePath = input.args?.file_path || input.args?.path || '';

    // 关键模块列表：这些文件的修改必须对照设计规范
    const criticalModules: Record<string, string> = {
      'api/search/route.ts': '搜索API必须实现 CSE + Tavily 融合，AI摘要必须注入TechGuru上下文，站内结果作为主事实源',
      'GlobalSearch/index.tsx': '搜索前端必须结构化渲染AI摘要（站内匹配/外部知识分区），不能只渲染纯文本',
      'api/search/lead.ts': 'Lead API必须完整记录搜索上下文',
    };

    for (const [module, rule] of Object.entries(criticalModules)) {
      if (filePath.includes(module)) {
        // 在输出中添加提醒，不阻断操作
        const reminder = `\n\n⚠️ DESIGN COMPLIANCE CHECK — ${module}\nRule: ${rule}\nVerify your implementation covers ALL design requirements before proceeding.\n`;
        if (output.output && typeof output.output === 'string') {
          output.output += reminder;
        }
      }
    }
  },
};
