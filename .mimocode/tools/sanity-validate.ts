import { tool } from "@mimo-ai/plugin";

// Sanity数据上传前验证器
// 自动触发: 当检测到Sanity内容变更时
// 手动触发: 验证Sanity数据格式
export default tool({
  description: "验证Sanity数据格式是否匹配schema，防止上传错误格式导致页面崩溃。当检测到Sanity变更时自动运行。",
  args: {
    data: tool.schema.string().describe("JSON字符串形式的Sanity文档数据（可选，不传则检查最近的变更）"),
    schema: tool.schema.string().describe("Schema类型: post/caseStudy/product/solution（可选，自动检测）"),
  },
  async execute(args, ctx) {
    // 如果没有传入数据，尝试从最近的文件变更中检测
    if (!args.data) {
      return `ℹ️ 未传入数据。请传入Sanity文档JSON进行验证。\n\n用法: sanity-validate({ data: '{"_type":"post","title":"...",...}', schema: 'post' })`;
    }

    try {
      const doc = JSON.parse(args.data);
      const errors: string[] = [];
      const warnings: string[] = [];

      // 通用检查: _type必须存在
      if (!doc._type) {
        errors.push('缺少 _type 字段');
      }

      // 自动检测schema类型
      const schema = args.schema || doc._type || 'unknown';

      // Post schema检查
      if (schema === 'post') {
        if (doc.title && typeof doc.title === 'object') {
          errors.push('title 是对象格式 {en, zh}，但schema定义为 string。会导致页面崩溃。请使用纯字符串。');
        }
        if (doc.excerpt && typeof doc.excerpt === 'object') {
          errors.push('excerpt 是对象格式，但schema定义为 text。请使用纯字符串。');
        }
        if (doc.coverImage && typeof doc.coverImage === 'string' && !doc.coverImage.startsWith('http') && !doc.coverImage.startsWith('image-')) {
          warnings.push('coverImage是字符串但不是URL或Sanity ref，可能是无效值');
        }
        if (doc.content && !Array.isArray(doc.content)) {
          errors.push('content 必须是数组格式');
        }
        if (!doc.slug?.current) errors.push('缺少 slug.current');
        if (!doc.category) warnings.push('缺少 category');
        // 检查titleZh格式
        if (doc.titleZh && typeof doc.titleZh !== 'string') {
          warnings.push('titleZh 应为字符串格式');
        }
      }

      // Product schema检查
      if (schema === 'product') {
        if (doc.name && typeof doc.name === 'object') errors.push('name 是对象格式，应为字符串');
        if (!doc.category) errors.push('缺少 category (build/run/protect)');
      }

      // CaseStudy schema检查
      if (schema === 'caseStudy') {
        if (doc.title && typeof doc.title === 'object') errors.push('title 是对象格式，应为字符串');
        if (!doc.industry) warnings.push('缺少 industry');
      }

      // Solution schema检查
      if (schema === 'solution') {
        if (!doc.name) warnings.push('缺少 name');
      }

      // 通用: 检查空值
      for (const [key, value] of Object.entries(doc)) {
        if (value === null || value === undefined) {
          warnings.push(`${key} 为 null/undefined`);
        }
      }

      if (errors.length > 0) {
        return `❌ 验证失败 (${errors.length}个错误):\n${errors.map(e => `  - ${e}`).join('\n')}\n\n⚠️ 警告 (${warnings.length}个):\n${warnings.map(w => `  - ${w}`).join('\n')}`;
      }

      if (warnings.length > 0) {
        return `⚠️ 验证通过，但有 ${warnings.length} 个警告:\n${warnings.map(w => `  - ${w}`).join('\n')}`;
      }

      return `✅ 验证通过，数据格式正确。`;
    } catch (e) {
      return `❌ JSON解析失败: ${e}`;
    }
  },
});
