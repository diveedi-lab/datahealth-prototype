import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Table2, ChevronRight, Clock } from 'lucide-react';
import type { FileNodeData } from '../../types';
import { NodeShell, MiniBar } from '../nodeShell';

type RFData = FileNodeData & { _dimmed?: boolean };

function TabularFileNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const cols = d.variables?.length ?? 0;
  return (
    <NodeShell color={d.color} selected={selected} dimmed={d._dimmed} clickable={d.analyzed} hasTarget hasSource>
      <div className="flex items-center gap-2">
        <Table2 className="w-4 h-4 shrink-0" style={{ color: d.color }} />
        <span className="font-mono text-[13px] font-semibold text-zinc-800 truncate flex-1">{d.label}</span>
        {d.analyzed ? (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase tracking-wide">
            analizzato
          </span>
        ) : (
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> da analizzare
          </span>
        )}
      </div>
      <p className="text-[10px] text-zinc-400 mt-1">
        CSV · {(d.rowCount ?? 0).toLocaleString('it-IT')} righe · {cols} colonne
      </p>
      {d.analyzed && (
        <div className="mt-2">
          <MiniBar value={d.completeness ?? 1} />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-zinc-400 truncate">
              {d.variables?.slice(0, 3).map((v) => v.name).join(', ')}…
            </span>
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5 shrink-0">
              dettagli <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </NodeShell>
  );
}

export const TabularFileNode = React.memo(TabularFileNodeImpl);
