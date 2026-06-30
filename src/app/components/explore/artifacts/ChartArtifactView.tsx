import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles, BarChart3, LineChart as LineIcon, PieChart as PieIcon, Hash, Table2, ScatterChart as ScatterIcon, Layers,
} from 'lucide-react';
import type { ExploreChart, ChartType } from '../types';
import { ChartView } from '../charts/ChartView';

const TYPE_META: { type: ChartType; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'bar', label: 'Barre', Icon: BarChart3 },
  { type: 'histogram', label: 'Istogramma', Icon: BarChart3 },
  { type: 'grouped', label: 'Raggruppato', Icon: Layers },
  { type: 'stacked', label: 'Impilato', Icon: Layers },
  { type: 'multiline', label: 'Multi-linea', Icon: LineIcon },
  { type: 'line', label: 'Linea', Icon: LineIcon },
  { type: 'pie', label: 'Torta', Icon: PieIcon },
  { type: 'scatter', label: 'Scatter', Icon: ScatterIcon },
  { type: 'crosstab', label: 'Tabella', Icon: Table2 },
  { type: 'kpi', label: 'KPI', Icon: Hash },
];

function useMeasuredHeight(min = 220) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(280);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height && height > 80) setH(Math.max(min, height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return [ref, h] as const;
}

export function ChartArtifactView({
  chart, sourceLabel, onChangeType,
}: {
  chart: ExploreChart;
  sourceLabel: string;
  onChangeType: (type: ChartType) => void;
}) {
  const [ref, height] = useMeasuredHeight();
  const available = TYPE_META.filter((m) => chart.altSpecs && chart.altSpecs[m.type]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="px-4 pt-3 text-xs text-zinc-400 truncate shrink-0">da {sourceLabel}</p>

      <div ref={ref} className="flex-1 min-h-0 px-4 py-2">
        <div className="h-full glass-card rounded-xl p-3">
          <ChartView spec={chart.spec} height={Math.max(220, height - 26)} />
        </div>
      </div>

      <div className="px-4 pb-3 space-y-3 shrink-0">
        <div className="bg-violet-50/50 border border-violet-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
          <p className="text-sm text-zinc-700 leading-relaxed">{chart.insight}</p>
        </div>
        {available.length > 1 && (
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
        )}
      </div>
    </div>
  );
}
