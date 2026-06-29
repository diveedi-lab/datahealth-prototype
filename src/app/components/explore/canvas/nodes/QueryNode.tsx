import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Search, Loader2, CheckCircle2, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import type { ExploreQuery, QueryStatus } from '../../types';
import { NodeShell } from '../../../ingestor/canvas/nodeShell';

type RFData = { query: ExploreQuery; _dimmed?: boolean };

const STATUS: Record<QueryStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  idle: { label: 'in coda', cls: 'bg-zinc-100 text-zinc-500', Icon: Search },
  running: { label: 'in esecuzione', cls: 'bg-blue-50 text-blue-600', Icon: Loader2 },
  success: { label: 'completata', cls: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 },
  empty: { label: 'nessun risultato', cls: 'bg-amber-50 text-amber-600', Icon: AlertCircle },
  error: { label: 'errore', cls: 'bg-rose-50 text-rose-600', Icon: XCircle },
};

function QueryNodeImpl({ data, selected }: NodeProps) {
  const { query: q, _dimmed } = data as RFData;
  const s = STATUS[q.status];
  const sqlFirst = q.sql.split('\n').filter((l) => !l.trim().startsWith('--')).join(' ').slice(0, 64);
  return (
    <NodeShell color="#2563eb" selected={selected} dimmed={_dimmed} width={290} clickable hasTarget hasSource>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 shrink-0 text-blue-600" />
        <span className="text-[13px] font-semibold text-zinc-800 truncate flex-1">{q.title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
      </div>
      <div className="mt-1">
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-1 ${s.cls}`}>
          <s.Icon className={`w-2.5 h-2.5 ${q.status === 'running' ? 'animate-spin' : ''}`} /> {s.label}
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-2 italic">“{q.prompt}”</p>
      <pre className="text-[9px] text-zinc-400 mt-1.5 bg-zinc-50 rounded px-1.5 py-1 font-mono truncate">{sqlFirst}…</pre>
      <div className="flex items-center justify-between mt-1.5 text-[9px] text-zinc-400">
        <span>{q.collections.length} input</span>
        {q.status === 'success' && <span>{q.rowCount.toLocaleString('it-IT')} righe</span>}
        {q.status === 'success' && <span>{(q.execMs / 1000).toFixed(2)}s</span>}
      </div>
    </NodeShell>
  );
}

export const QueryNode = React.memo(QueryNodeImpl);
