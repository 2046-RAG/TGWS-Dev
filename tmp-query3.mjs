import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/Test/.local/share/mimocode/mimocode.db', { open: true, readOnly: true });

// Get user messages from S52 session
console.log('=== USER MESSAGES (ses_0ae32476cffemt27iXiSe8kDEe) ===');
const userParts = db.prepare(`
  SELECT p.data, datetime(p.time_created/1000, 'unixepoch', 'localtime') as time_str
  FROM part p 
  WHERE p.session_id = 'ses_0ae32476cffemt27iXiSe8kDEe'
  AND p.message_id IN (SELECT id FROM message WHERE json_extract(data, '$.role') = 'user')
  ORDER BY p.time_created
`).all();
for (const p of userParts) {
  const d = JSON.parse(p.data);
  if (d.type === 'text' && d.text) {
    console.log(`  [${p.time_str}] ${d.text.substring(0, 200)}`);
  }
}

// Get tool calls from assistant (check for file writes)
console.log('\n=== FILE WRITE OPERATIONS ===');
const toolParts = db.prepare(`
  SELECT p.data, datetime(p.time_created/1000, 'unixepoch', 'localtime') as time_str
  FROM part p 
  WHERE p.session_id = 'ses_0ae32476cffemt27iXiSe8kDEe'
  AND json_extract(p.data, '$.type') = 'tool'
  ORDER BY p.time_created
`).all();
for (const p of toolParts) {
  const d = JSON.parse(p.data);
  const tool = d.tool;
  const input = d.state?.input;
  if (tool && input) {
    // Check for file writes
    if (tool === 'write' || tool === 'edit' || tool === 'bash') {
      const inputStr = JSON.stringify(input).substring(0, 200);
      console.log(`  [${p.time_str}] ${tool}: ${inputStr}`);
    }
  }
}

// Check the session that did dark mode work (look for older sessions)
console.log('\n=== ALL SESSIONS (last 50) ===');
const allSessions = db.prepare(`
  SELECT id, title, datetime(time_created/1000, 'unixepoch', 'localtime') as time_str
  FROM session 
  WHERE project_id = 'b897d9ae-bfcc-4a5a-9263-c91b1d7efed1'
  AND title NOT LIKE 'checkpoint-writer%'
  ORDER BY time_created DESC
  LIMIT 50
`).all();
for (const s of allSessions) {
  console.log(`${s.time_str} | ${s.id} | ${s.title}`);
}

db.close();
