'use client';

import { useState, useMemo } from 'react';
import { Cpu, Calendar, Server, Download, Calculator, Loader2 } from 'lucide-react';
import { calcScenario, calcCumulative, fuzzPrice } from '@/lib/tco';
import type { TcoCalculatorConfig, TcoInput } from '@/lib/tco';

interface Props {
  config: TcoCalculatorConfig;
  locale: string;
}

const VENDOR_COLORS: Record<string, string> = {
  vmware: '#EF4444',
  sangfor: '#F59E0B',
  nutanix: '#3B82F6',
};

const VENDOR_LABELS: Record<string, { en: string; zh: string }> = {
  vmware: { en: 'VMware', zh: 'VMware' },
  sangfor: { en: 'Sangfor', zh: '深信服' },
  nutanix: { en: 'Nutanix', zh: 'Nutanix' },
};

const CHART_W = 640;
const CHART_H = 300;
const PAD = { L: 70, R: 30, T: 30, B: 40 };

export default function TcoCalculatorClient({ config, locale }: Props) {
  const isZh = locale === 'zh';
  const scenarios = config.scenarios.sort((a, b) => a.order - b.order);

  const [coresPerCPU, setCoresPerCPU] = useState(16);
  const [cpuCount, setCpuCount] = useState(4);
  const [years, setYears] = useState(3);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [computed, setComputed] = useState(false);
  const [exporting, setExporting] = useState<null | 'png' | 'pdf'>(null);

  const input: TcoInput = { coresPerCPU, cpuCount, years };
  const scenario = scenarios[scenarioIdx];

  const result = useMemo(() => {
    if (!computed) return null;
    return calcScenario(config, scenarioIdx, input);
  }, [computed, config, scenarioIdx, coresPerCPU, cpuCount, years]);

  const chartData = useMemo(() => {
    if (!computed) return null;
    return calcCumulative(config, scenarioIdx, input);
  }, [computed, config, scenarioIdx, coresPerCPU, cpuCount, years]);

  const fmt = (n: number) => '$' + n.toLocaleString();
  const fmtFuzz = (n: number, estimated: boolean) =>
    estimated ? '~' + fmt(fuzzPrice(n)) : fmt(n);

  const handleExportPNG = async () => {
    setExporting('png');
    try {
      const svgEl = document.getElementById('tco-chart')?.querySelector('svg');
      if (!svgEl) return;
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = CHART_W * 2;
        canvas.height = (CHART_H + 200) * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Title
          ctx.fillStyle = '#18181B';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(`${scenario.name} — TCO Comparison`, 30, 40);
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#71717A';
          ctx.fillText(`${coresPerCPU} cores/CPU × ${cpuCount} CPUs × ${years} years`, 30, 65);
          // Chart
          ctx.drawImage(img, 0, 80, canvas.width, canvas.height - 80);
        }
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'tco-comparison.png';
        a.click();
        setExporting(null);
      };
      img.src = url;
    } catch { setExporting(null); }
  };

  return (
    <section className="py-20 sm:py-24 px-5 sm:px-8 bg-gradient-to-b from-white to-[#F4F4F5] dark:from-zinc-800/50 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] text-sm font-medium mb-4">
            <Calculator size={14} className="inline mr-1.5" />
            {isZh ? 'TCO 计算器' : 'TCO Calculator'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            {isZh ? '计算你的 VMware 替代方案成本' : 'Calculate Your VMware Alternative TCO'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-[15px]">
            {isZh ? '三厂商对比：VMware、Sangfor 深信服、Nutanix。输入你的环境参数，即时生成成本趋势图。' : 'Compare VMware, Sangfor, and Nutanix side by side. Enter your environment parameters and get instant cost projections.'}
          </p>
        </div>

        {/* Usage Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { num: '1', zh: '选择部署场景', en: 'Select a deployment scenario', zhDesc: '服务器虚拟化 / SDDC / 私有云', enDesc: 'Server Virtualization / SDDC / Private Cloud' },
            { num: '2', zh: '设置环境参数', en: 'Set your environment parameters', zhDesc: '每CPU核数、CPU颗数、订阅年数', enDesc: 'Cores per CPU, CPU sockets, subscription years' },
            { num: '3', zh: '查看对比并导出', en: 'Compare results & export', zhDesc: '折线图对比 + 明细表 + PNG 导出', enDesc: 'Line chart comparison + detail table + PNG export' },
          ].map((s, i) => (
            <div key={s.num} className="relative flex items-start gap-4 p-5 bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white ${i === 0 ? 'bg-[#00D4FF]' : i === 1 ? 'bg-[#7B61FF]' : 'bg-[#22C55E]'}`}>
                {s.num}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{isZh ? s.zh : s.en}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{isZh ? s.zhDesc : s.enDesc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Panel + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel — 2/5 width on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm sticky top-24">
              {/* Scenario Selector */}
              <div className="mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 block">
                  {isZh ? '部署场景' : 'Deployment Scenario'}
                </label>
                <div className="space-y-2">
                  {scenarios.map((s, i) => (
                    <button key={i} onClick={() => { setScenarioIdx(i); setComputed(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        scenarioIdx === i
                          ? 'bg-[#00D4FF]/5 border-2 border-[#00D4FF] text-gray-900 dark:text-white'
                          : 'bg-gray-50 dark:bg-zinc-700/50 border-2 border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-zinc-600'
                      }`}>
                      <div className="font-semibold">{isZh && s.nameZh ? s.nameZh : s.name}</div>
                      {s.description && <div className="text-xs text-gray-400 mt-0.5 font-normal">{isZh && s.descriptionZh ? s.descriptionZh : s.description}</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores Per CPU */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  <Cpu size={14} className="text-[#00D4FF]" />
                  {isZh ? '每 CPU 核数' : 'Cores Per CPU'}
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={8} max={64} step={4} value={coresPerCPU}
                    onChange={(e) => setCoresPerCPU(Number(e.target.value))}
                    className="w-full accent-[#00D4FF]" />
                  <span className="text-lg font-bold text-[#00D4FF] w-12 text-right tabular-nums">{coresPerCPU}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>8</span><span>64</span></div>
              </div>

              {/* CPU Count */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  <Server size={14} className="text-[#7B61FF]" />
                  {isZh ? 'CPU 颗数' : 'CPU Sockets'}
                </label>
                <div className="flex items-center gap-3">
                  <input type="range" min={2} max={32} step={1} value={cpuCount}
                    onChange={(e) => setCpuCount(Number(e.target.value))}
                    className="w-full accent-[#7B61FF]" />
                  <span className="text-lg font-bold text-[#7B61FF] w-12 text-right tabular-nums">{cpuCount}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>2</span><span>32</span></div>
              </div>

              {/* Years */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  <Calendar size={14} className="text-[#22C55E]" />
                  {isZh ? '订阅年数' : 'Years'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map((y) => (
                    <button key={y} onClick={() => setYears(y)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        years === y ? 'bg-[#22C55E] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                      }`}>
                      {y} {isZh ? '年' : 'yr'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-3 rounded-lg bg-gray-50 dark:bg-zinc-700/50 text-xs text-gray-500 dark:text-gray-400">
                {isZh ? '总核数' : 'Total cores'}: <span className="font-bold text-gray-900 dark:text-white tabular-nums">{(coresPerCPU * cpuCount).toLocaleString()}</span>
              </div>

              {/* Calculate */}
              <button onClick={() => setComputed(true)}
                className="w-full bg-[#00D4FF] text-white font-semibold py-3.5 rounded-xl hover:bg-[#00B8E6] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-[15px]">
                <Calculator size={18} />
                {isZh ? '计算 TCO' : 'Calculate TCO'}
              </button>
            </div>
          </div>

          {/* Results — 3/5 width on desktop */}
          <div className="lg:col-span-3">
            {!computed && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
                <div className="w-16 h-16 rounded-full bg-[#00D4FF]/5 flex items-center justify-center mb-4">
                  <Calculator size={28} className="text-[#00D4FF]/40" />
                </div>
                <p className="text-gray-400 text-sm">{isZh ? '选择场景并点击「计算 TCO」查看结果' : 'Select a scenario and calculate to see results'}</p>
              </div>
            )}

            {computed && result && chartData && (
              <div className="space-y-5">
                {/* Chart */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
                  <div id="tco-chart">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{isZh ? '累计成本趋势' : 'Cumulative Cost Trend'}</h3>
                    <CumulativeChart chartData={chartData} years={years} />
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm overflow-x-auto">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{isZh ? `${years}年 TCO 对比` : `${years}-Year TCO Comparison`}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-700">
                        <th className="text-left py-2 font-medium text-gray-400">
                          <span className="text-xs uppercase tracking-wider">{isZh ? '厂商' : 'Vendor'}</span>
                          <div className="text-xs font-normal">{isZh ? '方案' : 'Bundle'}</div>
                        </th>
                        <th className="text-right py-2 font-medium text-gray-400 text-xs uppercase tracking-wider">{isZh ? '模块' : 'Modules'}</th>
                        <th className="text-right py-2 font-medium text-gray-400 text-xs uppercase tracking-wider">{isZh ? '总价' : 'Total'}</th>
                        <th className="text-right py-2 font-medium text-gray-400 text-xs uppercase tracking-wider">{isZh ? '年均' : 'Per yr'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, vi) => (
                        <tr key={vi} className="border-b border-gray-100 dark:border-zinc-700/50 last:border-0">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: VENDOR_COLORS[r.vendor] }} />
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white text-[13px]">{r.vendor.charAt(0).toUpperCase() + r.vendor.slice(1)}</span>
                                {r.isEstimated && <span className="ml-1 text-[10px] text-gray-400">(est.)</span>}
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5 ml-4 pl-1">{isZh && r.bundleNameZh ? r.bundleNameZh : r.bundleName}</div>
                          </td>
                          <td className="py-3 text-right text-xs text-gray-400 max-w-[200px]">
                            {r.includedModules.map((m, i) => (
                              <span key={i} className="inline-block px-1.5 py-0.5 mr-1 mb-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-[10px]">{m.split('(')[0].trim()}</span>
                            ))}
                          </td>
                          <td className="py-3 text-right font-bold tabular-nums" style={{ color: VENDOR_COLORS[r.vendor] }}>
                            {fmtFuzz(r.totalCost, r.isEstimated)}
                          </td>
                          <td className="py-3 text-right text-gray-500 dark:text-gray-300 tabular-nums text-xs">
                            {fmtFuzz(r.costPerYear, r.isEstimated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Export */}
                <div className="flex gap-2 justify-end">
                  <button onClick={handleExportPNG} disabled={exporting !== null}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-zinc-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50">
                    {exporting === 'png' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {isZh ? '导出 PNG' : 'Export PNG'}
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-gray-400 text-center px-4">
                  {config.disclaimer || (isZh ? '估算仅供参考，不构成正式报价。' : 'Estimates for informational purposes only.')}
                  <br />
                  <span className="text-gray-300">Data as of {config.lastUpdated}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CumulativeChart({ chartData, years }: { chartData: ReturnType<typeof calcCumulative>; years: number }) {
  if (!chartData) return null;

  const allCosts = chartData.flatMap((d) => d.results.map((r) => r.cost));
  const maxCost = Math.max(...allCosts, 1);
  const plotW = CHART_W - PAD.L - PAD.R;
  const plotH = CHART_H - PAD.T - PAD.B;

  const yTicks = Array.from({ length: 5 }, (_, i) => (i / 4) * maxCost);

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" role="img" aria-label="TCO cumulative cost chart">
      {/* Grid lines + Y labels */}
      {yTicks.map((t, i) => {
        const y = PAD.T + plotH - (t / maxCost) * plotH;
        return (
          <g key={i}>
            <line x1={PAD.L} y1={y} x2={CHART_W - PAD.R} y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
            <text x={PAD.L - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">
              ${Math.round(t / 1000)}K
            </text>
          </g>
        );
      })}
      {/* X labels */}
      {chartData.map((d, i) => {
        const x = PAD.L + (i / (years - 1 || 1)) * plotW;
        return (
          <text key={i} x={x} y={CHART_H - 12} textAnchor="middle" fontSize="10" fill="#9CA3AF">
            Y{d.year}
          </text>
        );
      })}
      {/* Lines */}
      {chartData[0]?.results.map((r, vi) => {
        const color = VENDOR_COLORS[r.vendor] || '#999';
        const points = chartData.map((d, yi) => {
          const dr = d.results[vi];
          if (!dr) return null;
          const x = PAD.L + (yi / (years - 1 || 1)) * plotW;
          const y = PAD.T + plotH - (dr.cost / maxCost) * plotH;
          return `${x},${y}`;
        }).filter(Boolean).join(' ');
        return (
          <polyline key={vi} points={points} fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={r.isEstimated ? '6,4' : 'none'} strokeOpacity={r.isEstimated ? 0.6 : 1} />
        );
      })}
      {/* Legend */}
      {chartData[0]?.results.map((r, vi) => {
        const x = PAD.L + vi * 160;
        const color = VENDOR_COLORS[r.vendor] || '#999';
        return (
          <g key={vi}>
            <line x1={x} y1={12} x2={x + 20} y2={12} stroke={color} strokeWidth="2.5"
              strokeDasharray={r.isEstimated ? '4,3' : 'none'} strokeOpacity={r.isEstimated ? 0.6 : 1} />
            <text x={x + 28} y={16} fontSize="11" fill="#4B5563">
              {r.vendor.charAt(0).toUpperCase() + r.vendor.slice(1)}{r.isEstimated ? ' (est.)' : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}