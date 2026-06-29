import React from 'react';
import { X, Sparkles, BarChart3, LineChart as LineIcon, PieChart as PieIcon, Hash, Activity } from 'lucide-react';
import type { ExploreChart, ChartType } from '../types';
import { ChartView } from '../charts/ChartView';
import { getCollection } from '../mock/mockCatalog';

const TYPE_META: { type: ChartType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'bar', label: 'Barre', Icon: BarChart3 },
  { type: 'histogram', label: 'Istogramma', Icon: BarChart3 },
  { type: 'line', label: 'Linea', Icon: LineIcon },
  { type: 'pie', label: 'Torta', Icon: PieIcon },
  { type: 'kpi', label: 'KPI', Icon: Hash },
];

export function ChartDrillDown({
  chart, sourceLabel, chatOpen, onToggleChat, onClose, onChangeType,
}: {
  chart: ExploreChart;
  sourceLabel: string;
  chatOpen: boolean;
  onToggleChat: () => void;
  onClose: () => void;
  onChangeType: (type: ChartType) => void;
}) {
  const available = TYPE_META.filter((m) => chart.altSpecs && chart.altSpecs[m.type]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="flex items-start gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
        {chart.kind === 'analysis'
          ? <Activity className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
          : <BarChart3 className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{chart.title}</p>
          <p className="text-xs text-zinc-400 truncate">da {sourceLabel}</p>
        </div>
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 border transition-colors ${chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-700 border-violet-200 hover:bg-violet-50'}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI
        </button>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-auto min-h-0 p-4 space-y-4">
        <div className="border border-zinc-200 rounded-xl p-3">
          <ChartView spec={chart.spec} height={280} />
        </div>

        <div className="bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
          <p className="text-sm text-zinc-700 leading-relaxed">{chart.insight}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5">Tipo di grafico</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((m) => (
              <button
                key={m.type}
                onClick={() => onChangeType(m.type)}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${chart.chartType === m.type ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
              >
                <m.Icon className="w-3 h-3" /> {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
