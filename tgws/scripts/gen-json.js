const fs = require('fs');
const path = require('path');

// Define articles with proper JS string escaping
// Use single quotes for outer strings to avoid conflicts with content

const articles = [
  {
    title: "Legacy System AI Augmentation: Overview Guide",
    titleZh: "\u4F20\u7EDF\u7CFB\u7EDFAI\u589E\u5F3A\uFF1A\u5168\u9762\u6982\u89C8\u6307\u5357",
    slug: "legacy-system-ai-augmentation-overview",
    excerpt: "Learn how to augment legacy systems with AI without full replacement. Covers core concepts, use cases, and implementation strategies.",
    excerptZh: "\u4E86\u89E3\u5982\u4F55\u7528AI\u589E\u5F3A\u4F20\u7EDF\u7CFB\u7EDF\uFF0C\u800C\u4E0D\u9700\u8981\u5B8C\u5168\u66FF\u6362\u3002\u672C\u6587\u6DB5\u76D6AI\u589E\u5F3A\u7684\u6838\u5FC3\u6982\u5FF5\u3001\u9002\u7528\u573A\u666F\u548C\u5B9E\u65BD\u7B56\u7565\u3002",
    contentEn: "",
    contentZh: ""
  }
];

// This approach is too tedious. Let me use a different strategy.
// I'll read the original content from the batch-create-posts.js file (which has the content in JS strings)
// and extract it.

// Actually, the simplest approach: just write the JSON file line by line,
// using the content directly without template literals.

console.log("Generating JSON from article definitions...");

// The articles array is defined above but with empty content.
// Let me read the content from a separate file and combine.

// Actually, let me just write a simpler approach: 
// Create the JSON by writing it directly with proper escaping.

// For each article, I need to write the JSON with escaped content.
// The key insight: I can use JSON.stringify to properly escape everything.

const outPath = path.join(__dirname, 'articles-data.json');

// Start the JSON array
let jsonParts = ['[\n'];

for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  // Use JSON.stringify for each field to ensure proper escaping
  const obj = {
    title: a.title,
    titleZh: a.titleZh,
    slug: a.slug,
    excerpt: a.excerpt,
    excerptZh: a.excerptZh,
    contentEn: a.contentEn,
    contentZh: a.contentZh
  };
  jsonParts.push(JSON.stringify(obj, null, 2));
  if (i < articles.length - 1) jsonParts.push(',\n');
}

jsonParts.push('\n]');

// This won't work because contentEn and contentZh are empty.
// I need a different approach.

console.log("Need to populate content first. Generating placeholder...");
console.log("Will use a different approach.");

// Alternative: Write the content to a JS file that exports the data,
// then have the upload script import it directly.

// But actually, the upload script already imports JSON.
// Let me just fix the original content to use proper escaping.

// The root cause: the original content had Chinese quotes (") inside 
// that look like ASCII quotes but are actually Unicode U+201C/U+201D.
// These should be fine in JSON. The problem was likely with actual ASCII quotes.

// Let me just write a minimal test first.
const testObj = {
  title: "Test",
  contentZh: '用户不需要记住精确的字段名，可以直接问"显示Q3所有逾期订单"。'
};

try {
  const testJson = JSON.stringify(testObj);
  const parsed = JSON.parse(testJson);
  console.log("Test passed:", parsed.contentZh.substring(0, 50));
} catch (e) {
  console.log("Test failed:", e.message);
}
