import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Table2, ChevronRight } from 'lucide-react';
import type { TargetTable } from '../../types';
import { NodeShell } from '../nodeShell';

type RFData = TargetTable & { _dimmed?: boolean; _mapped?: number };

const FMT_BADGE: Record<TargetTable['format'], string> = {
  cdisc: 'bg-violet-100 text-violet-700',
  omop: 'bg-cyan-100 text-cyan-700',
  fhir: 'bg-emerald-100 text-emerald-700',
};

function TargetTableNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const mapped = d._mapped ?? 0;
  const shown = d.columns.slice(0, 5);
  return (
    <NodeShell color={d.color} selected={selected} dimmed={d._dimmed} width={224} clickable hasTarget hasSource={false}>
      <div className="flex items-center gap-2">
        <Table2 className="w-4 h-4 shrink-0" style={{ color: d.color }} />
        <span className="font-mono text-[13px] font-semibold text-zinc-800 truncate flex-1">{d.name}</span>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase ${FMT_BADGE[d.format]}`}>{d.format}</span>
      </div>
      <p className="text-[10px] text-zinc-400 mt-0.5">{d.label}</p>
      <div className="mt-2 space-y-0.5">
        {shown.map((c) => (
          <div key={c.name} className="flex items-center gap-1 text-[10px]">
            <span className={`w-1 h-1 rounded-full ${c.mappedFrom ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
            <span className="font-mono text-zinc-600 truncate">{c.name}</span>
            {c.required && <span className="text-[8px] text-amber-500">*</span>}
          </div>
        ))}
        {d.columns.length > 5 && <p className="text-[9px] text-zinc-400 pl-2">+{d.columns.length - 5} colonne</p>}
      </div>
      <div className="flex items-center justify-between mt-1.5 text-[9px] text-zinc-400">
        <span>{mapped}/{d.columns.length} mappate</span>
        <span className="flex items-center gap-0.5">{d.estRowCount.toLocaleString('it-IT')} righe <ChevronRight className="w-3 h-3" /></span>
      </div>
    </NodeShell>
  );
}

export const TargetTableNode = React.memo(TargetTableNodeImpl);
