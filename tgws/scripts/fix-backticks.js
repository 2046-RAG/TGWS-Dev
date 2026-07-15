const fs = require('fs');
const path = 'D:\\软件集\\Mimo\\WorkSpace\\TGWS\\tgws\\scripts\\batch-create-posts.js';
let content = fs.readFileSync(path, 'utf8');

// Replace Chinese arrow patterns in template literals with regular strings
// The pattern: → in backtick strings causes issues because → is used in diagram text
// But the real issue is that some lines in contentZh start with backtick-like characters

// Actually, the simplest fix: replace all  backtick chars inside the contentZh strings
// We need to find contentZh: `...` blocks and escape internal backticks

// Strategy: Use a state machine to find contentZh blocks
const lines = content.split('\n');
let result = [];
let inContentZh = false;
let contentZhStarted = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (!inContentZh) {
    // Check if this line starts a contentZh template literal
    if (line.includes('contentZh: `')) {
      inContentZh = true;
      contentZhStarted = true;
      // Replace the opening backtick with a string approach
      // We'll collect all lines until we find the closing pattern
    }
    result.push(line);
    continue;
  }
  
  // We're inside a contentZh block
  // Check if this line ends it (has `,...  or just `,)
  // The ending pattern is: ` followed by comma and newline or just backtick-comma
  
  if (line.match(/`,$/) || line.match(/^    `,$/)) {
    // This is the closing backtick
    inContentZh = false;
    result.push(line);
    continue;
  }
  
  // Check if line contains backticks (used in code blocks inside the Chinese content)
  // Replace them with a safe alternative
  if (line.includes('`')) {
    // Replace backtick with a safe character for code blocks
    line = line.replace(/`/g, '\u3010\u3011'); // Replace with 【】 brackets
  }
  
  result.push(line);
}

fs.writeFileSync(path, result.join('\n'));
console.log('Fixed backtick issues in Chinese content');
