import React from 'react';
import {
  Search, BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity, Hash, ChevronRight, ScatterChart as ScatterIcon, Table2,
} from 'lucide-react';
import type { Artifact, ChartType } from '../types';
import { ChartView } from '../charts/ChartView';

const CHART_ICON: Record<ChartType, React.ComponentType<{ className?: string }>> = {
  bar: BarChart3, histogram: BarChart3, grouped: BarChart3, stacked: BarChart3, crosstab: Table2,
  line: LineIcon, multiline: LineIcon, pie: PieIcon, scatter: ScatterIcon, kpi: Hash,
};

export function ArtifactCard({
  artifact, active, onOpen,
}: {
  artifact: Artifact;
  active?: boolean;
  onOpen: (id: string) => void;
}) {
  const isChart = artifact.kind === 'chart';
  const Icon = isChart
    ? (artifact.chart.kind === 'analysis' ? Activity : (CHART_ICON[artifact.chart.chartType] ?? BarChart3))
    : Search;
  const subtitle = isChart
    ? artifact.chart.insight
    : artifact.query.status === 'running'
      ? 'esecuzione…'
      : artifact.query.status === 'success'
        ? `${artifact.query.rowCount.toLocaleString('it-IT')} righe`
        : artifact.query.status === 'empty' ? 'nessun risultato' : 'query';

  return (
    <button
      onClick={() => onOpen(artifact.id)}
      className={`w-full text-left rounded-xl border bg-white transition-all hover:shadow-sm ${active ? 'border-blue-400 ring-1 ring-blue-200' : 'border-zinc-200 hover:border-zinc-300'}`}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isChart ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-800 truncate">{artifact.title}</p>
          <p className="text-[10px] text-zinc-400 truncate">{subtitle}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
      </div>
      {isChart && artifact.chart.chartType !== 'kpi' && artifact.chart.chartType !== 'crosstab' && (
        <div className="px-3 pb-2 pointer-events-none">
          <ChartView spec={artifact.chart.spec} height={64} mini />
        </div>
      )}
    </button>
  );
}
