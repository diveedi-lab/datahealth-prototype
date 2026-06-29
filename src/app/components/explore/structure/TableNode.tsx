import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Table2, Key, ArrowRight } from 'lucide-react';
import type { ExploreTable } from '../types';
import { NodeShell } from '../../ingestor/canvas/nodeShell';
import { TYPE_ICON } from './typeIcons';

type RFData = { table: ExploreTable; highlightColumns?: string[]; dimmed?: boolean; isResult?: boolean };

function TableNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const t = d.table;
  const hl = d.highlightColumns;
  return (
    <NodeShell color={d.isResult ? '#10b981' : t.color} selected={selected} dimmed={d.dimmed} width={240} clickable hasTarget hasSource>
      <div className="flex items-center gap-2 mb-1.5">
        <Table2 className="w-4 h-4 shrink-0" style={{ color: d.isResult ? '#10b981' : t.color }} />
        <span className="text-[13px] font-semibold text-zinc-800 truncate flex-1">{t.label}</span>
        {d.isResult
          ? <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase">risultato</span>
          : <span className="text-[10px] text-zinc-400">{t.rowCount.toLocaleString('it-IT')}</span>}
      </div>
      <div className="space-y-0.5">
        {t.columns.map((c) => {
          const dim = hl ? !hl.includes(c.name) : false;
          return (
            <div key={c.name} className={`flex items-center gap-1.5 ${dim ? 'opacity-35' : ''}`}>
              {TYPE_ICON[c.type] ?? <Key className="w-3.5 h-3.5 text-zinc-400" />}
              <span className="font-mono text-[11px] text-zinc-700 truncate flex-1">{c.name}</span>
              {c.pk && <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-amber-100 text-amber-700">PK</span>}
              {c.fk && (
                <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-blue-100 text-blue-700 flex items-center gap-0.5">
                  FK <ArrowRight className="w-2 h-2" /> {c.fk.table}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </NodeShell>
  );
}

export const TableNode = React.memo(TableNodeImpl);
