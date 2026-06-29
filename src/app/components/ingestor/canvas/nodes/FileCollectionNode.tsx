import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Images, ChevronRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { FileNodeData } from '../../types';
import { NodeShell } from '../nodeShell';

type RFData = FileNodeData & { _dimmed?: boolean };

function FileCollectionNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const m = d.match;
  return (
    <div className="relative">
      {/* effetto "stack": due card sfalsate dietro */}
      <span className="absolute -right-1.5 -bottom-1.5 left-3 top-3 rounded-xl border border-zinc-200 bg-white" />
      <span className="absolute -right-0.5 -bottom-0.5 left-1.5 top-1.5 rounded-xl border border-zinc-200 bg-white" />
      <div className="relative">
        <NodeShell color={d.color} selected={selected} dimmed={d._dimmed} width={244} clickable={d.analyzed}>
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 shrink-0" style={{ color: d.color }} />
            <span className="font-mono text-[13px] font-semibold text-zinc-800 truncate flex-1">{d.label}</span>
            {d.analyzed && <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            {(d.memberCount ?? 0).toLocaleString('it-IT')} file {d.fileKind} · {d.totalSizeGB} GB
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono truncate">{d.namingPattern}</p>
          {d.analyzed && m && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px]">
              {m.unmatched === 0 ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500" />
              )}
              <span className="text-zinc-500">
                match {m.matched.toLocaleString('it-IT')}/{m.total.toLocaleString('it-IT')}
              </span>
              {m.unmatched > 0 && (
                <span className="text-amber-600 font-medium">· {m.unmatched} orfane</span>
              )}
            </div>
          )}
        </NodeShell>
      </div>
    </div>
  );
}

export const FileCollectionNode = React.memo(FileCollectionNodeImpl);
