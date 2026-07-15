import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/Test/.local/share/mimocode/mimocode.db', { open: true, readOnly: true });

// Check actual data structure of messages
console.log('=== MESSAGE DATA STRUCTURE (first message of ses_0ae32476cffemt27iXiSe8kDEe) ===');
const row = db.prepare("SELECT data FROM message WHERE session_id = 'ses_0ae32476cffemt27iXiSe8kDEe' ORDER BY time_created LIMIT 1").get();
if (row) {
  console.log(row.data);
}

// Check part structure
console.log('\n=== PART DATA STRUCTURE (first parts) ===');
const parts = db.prepare("SELECT p.data FROM part p WHERE p.session_id = 'ses_0ae32476cffemt27iXiSe8kDEe' ORDER BY p.time_created LIMIT 3").all();
for (const p of parts) {
  console.log(p.data?.substring(0, 500));
  console.log('---');
}

// Check older substantive sessions (S52 dark mode work)
console.log('\n=== OLDER SESSIONS (before the "加载完整项目" sessions) ===');
const olderSessions = db.prepare("SELECT id, title, time_created, datetime(time_created/1000, 'unixepoch', 'localtime') as time_str FROM session WHERE project_id = 'b897d9ae-bfcc-4a5a-9263-c91b1d7efed1' ORDER BY time_created DESC LIMIT 30").all();
for (const s of olderSessions) {
  if (s.title && !s.title.includes('checkpoint-writer') && !s.title.includes('ask:')) {
    console.log(`${s.time_str} | ${s.id} | ${s.title}`);
  }
}

// Check the most recent substantive session
console.log('\n=== MOST RECENT SUBSTANTIVE SESSION ===');
const substantive = db.prepare("SELECT id, title, time_created, datetime(time_created/1000, 'unixepoch', 'localtime') as time_str FROM session WHERE project_id = 'b897d9ae-bfcc-4a5a-9263-c91b1d7efed1' AND title NOT LIKE 'checkpoint-writer%' AND title NOT LIKE 'ask:%' ORDER BY time_created DESC LIMIT 5").all();
for (const s of substantive) {
  console.log(`${s.time_str} | ${s.id} | ${s.title}`);
}

db.close();
