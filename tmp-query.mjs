import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/Test/.local/share/mimocode/mimocode.db', { open: true, readOnly: true });

// 1. Recent sessions for this project
console.log('=== RECENT SESSIONS ===');
const sessions = db.prepare("SELECT id, title, time_created, datetime(time_created/1000, 'unixepoch', 'localtime') as time_str FROM session WHERE project_id = 'b897d9ae-bfcc-4a5a-9263-c91b1d7efed1' ORDER BY time_created DESC LIMIT 20").all();
for (const s of sessions) {
  console.log(`${s.time_str} | ${s.id} | ${s.title}`);
}

// 2. Get messages from the most recent non-checkpoint sessions
console.log('\n=== RECENT SESSION MESSAGES (ses_0ae32476cffemt27iXiSe8kDEe) ===');
const msgs = db.prepare("SELECT m.id, json_extract(m.data, '$.role') as role, substr(json_extract(m.data, '$.content'), 1, 300) as preview FROM message m WHERE m.session_id = 'ses_0ae32476cffemt27iXiSe8kDEe' ORDER BY m.time_created").all();
for (const m of msgs) {
  console.log(`  [${m.role}] ${m.preview}`);
}

console.log('\n=== RECENT SESSION MESSAGES (ses_0aea8350dffeWEt31Z5wDi8g7T) ===');
const msgs2 = db.prepare("SELECT m.id, json_extract(m.data, '$.role') as role, substr(json_extract(m.data, '$.content'), 1, 300) as preview FROM message m WHERE m.session_id = 'ses_0aea8350dffeWEt31Z5wDi8g7T' ORDER BY m.time_created").all();
for (const m of msgs2) {
  console.log(`  [${m.role}] ${m.preview}`);
}

db.close();
