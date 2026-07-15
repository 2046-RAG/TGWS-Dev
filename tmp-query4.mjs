import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/Test/.local/share/mimocode/mimocode.db', { open: true, readOnly: true });

// Search for user messages containing rule/decision keywords in recent sessions
const recentSessionIds = [
  'ses_0ae32476cffemt27iXiSe8kDEe',
  'ses_0aec6139affeaZr3EV5uUpGxhv',
  'ses_0b2e888deffes229MIK13gAW8N',
  'ses_0b30bc8f8ffeWeb0iTSwYGSdbb',
  'ses_0b7961b85ffe2G2Ogv0GgzvSvP'
];

console.log('=== USER MESSAGES WITH RULES/DECISIONS ===');
for (const sid of recentSessionIds) {
  const userMsgs = db.prepare(`
    SELECT p.data, datetime(p.time_created/1000, 'unixepoch', 'localtime') as time_str
    FROM part p 
    JOIN message m ON p.message_id = m.id
    WHERE m.session_id = ?
    AND json_extract(m.data, '$.role') = 'user'
    AND json_extract(p.data, '$.type') = 'text'
    ORDER BY p.time_created
  `).all(sid);

  for (const m of userMsgs) {
    const d = JSON.parse(m.data);
    const text = d.text || '';
    if (text.length > 10 && text.length < 500) {
      console.log(`  [${m.time_str}] ${sid.substring(0, 20)}: ${text.substring(0, 300)}`);
    }
  }
}

// Check the most recent checkpoint from a different session
console.log('\n=== CHECKPOINT FROM ses_0b2e888deffes229MIK13gAW8N ===');
const checkpoint = db.prepare(`
  SELECT p.data, datetime(p.time_created/1000, 'unixepoch', 'localtime') as time_str
  FROM part p 
  JOIN message m ON p.message_id = m.id
  WHERE m.session_id = 'ses_0b2e888deffes229MIK13gAW8N'
  AND json_extract(p.data, '$.type') = 'text'
  AND json_extract(p.data, '$.text') LIKE '%Topic%'
  ORDER BY p.time_created DESC
  LIMIT 1
`).all();

for (const c of checkpoint) {
  const d = JSON.parse(c.data);
  console.log(d.text?.substring(0, 500));
}

db.close();
