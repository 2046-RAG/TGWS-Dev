import { Sparkles } from 'lucide-react';

interface AiSummarySection {
  label: string;
  color: string;
  bg: string;
  content: string;
}

function parseAiSummary(raw: string): AiSummarySection[] {
  const sections: AiSummarySection[] = [];
  const parts = raw.split(/\n?\[(\w+)\]\n?/);
  for (let i = 1; i < parts.length; i += 2) {
    const tag = parts[i].toUpperCase();
    const content = (parts[i + 1] || '').trim();
    if (!content) continue;
    if (tag === 'RESOURCES') {
      sections.push({ label: 'TechGuru Resources', color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/5', content });
    } else if (tag === 'INSIGHT') {
      sections.push({ label: 'AI Insight', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/5', content });
    } else if (tag === 'SOURCES') {
      sections.push({ label: 'Sources', color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/5', content });
    }
  }
  if (sections.length === 0 && raw.length > 20) {
    sections.push({ label: 'AI Summary', color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/5', content: raw });
  }
  return sections;
}

export default function AiSummaryCard({ aiSummary }: { aiSummary: string }) {
  const sections = parseAiSummary(aiSummary);
  if (sections.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
      {sections.map((s, idx) => (
        <div key={idx} className={`p-4 ${s.bg} ${idx > 0 ? 'border-t border-gray-100 dark:border-zinc-700/50' : ''}`}>
          <div className="flex items-start gap-3">
            <Sparkles size={16} className={`mt-0.5 shrink-0 ${s.color}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${s.color}`}>{s.label}</p>
              <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">{s.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
