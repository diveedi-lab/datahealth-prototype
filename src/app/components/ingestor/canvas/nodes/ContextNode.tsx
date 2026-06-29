import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { BookOpen, FileText, StickyNote, Table } from 'lucide-react';
import type { FileNodeData } from '../../types';
import { NodeShell } from '../nodeShell';

type RFData = FileNodeData & { _dimmed?: boolean };

const CTX_ICON: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'variable-mapping': Table,
  'clinical-context': BookOpen,
  'annotated-ecrf': FileText,
  'data-dictionary': StickyNote,
};

function ContextNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const Icon = CTX_ICON[d.contextType ?? ''] ?? BookOpen;
  return (
    <div className="rounded-xl" style={{ background: '#fffbeb' }}>
      <NodeShell color={d.color} selected={selected} dimmed={d._dimmed} width={210} dashed clickable={d.analyzed} hasTarget hasSource>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 shrink-0" style={{ color: d.color }} />
          <span className="font-mono text-[12px] font-semibold text-zinc-800 truncate flex-1">{d.label}</span>
        </div>
        <p className="text-[9px] uppercase tracking-wide text-amber-600 mt-1 font-medium">contesto · supporto</p>
        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{d.role}</p>
      </NodeShell>
    </div>
  );
}

export const ContextNode = React.memo(ContextNodeImpl);
