import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Activity, Hash, ChevronRight } from 'lucide-react';
import type { ExploreChart, ChartType } from '../../types';
import { NodeShell } from '../../../ingestor/canvas/nodeShell';
import { ChartView } from '../../charts/ChartView';

type RFData = { chart: ExploreChart; _dimmed?: boolean };

const ICON: Record<ChartType, React.ComponentType<{ className?: string }>> = {
  bar: BarChart3, histogram: BarChart3, line: LineIcon, pie: PieIcon, kpi: Hash,
};

function ChartNodeImpl({ data, selected }: NodeProps) {
  const { chart: c, _dimmed } = data as RFData;
  const Icon = c.kind === 'analysis' ? Activity : ICON[c.chartType] ?? BarChart3;
  return (
    <NodeShell color="#7c3aed" selected={selected} dimmed={_dimmed} width={260} clickable hasTarget hasSource={false}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0 text-violet-600" />
        <span className="text-[13px] font-semibold text-zinc-800 truncate flex-1">{c.title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
      </div>
      <div className="mt-2 pointer-events-none">
        <ChartView spec={c.spec} height={72} mini />
      </div>
      <p className="text-[10px] text-zinc-400 mt-1.5 line-clamp-1">{c.insight}</p>
    </NodeShell>
  );
}

export const ChartNode = React.memo(ChartNodeImpl);
