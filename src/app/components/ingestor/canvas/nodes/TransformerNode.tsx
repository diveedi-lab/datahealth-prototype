import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Wand2, CheckCircle2, AlertTriangle, Clock, XCircle, ChevronRight } from 'lucide-react';
import type { Transformer, ValidationStatus } from '../../types';
import { NodeShell } from '../nodeShell';

type RFData = Transformer & { _dimmed?: boolean };

const KIND_LABEL: Record<Transformer['kind'], string> = {
  '1:1': '1:1', split: 'split', merge: 'merge', complex: 'complex', drop: 'drop',
};

const VALIDATION: Record<ValidationStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'da validare', cls: 'bg-amber-50 text-amber-600', Icon: Clock },
  validated: { label: 'validato', cls: 'bg-emerald-50 text-emerald-600', Icon: CheckCircle2 },
  rejected: { label: 'rifiutato', cls: 'bg-rose-50 text-rose-600', Icon: XCircle },
  'needs-review': { label: 'da rivedere', cls: 'bg-orange-50 text-orange-600', Icon: AlertTriangle },
};

function TransformerNodeImpl({ data, selected }: NodeProps) {
  const d = data as RFData;
  const v = VALIDATION[d.validation];
  const codeFirst = d.code.split('\n').slice(0, 2).join(' ').slice(0, 60);
  return (
    <NodeShell color="#6366f1" selected={selected} dimmed={d._dimmed} width={280} clickable hasTarget hasSource>
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 shrink-0 text-indigo-500" />
        <span className="text-[13px] font-semibold text-zinc-800 truncate flex-1">{d.title}</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">{KIND_LABEL[d.kind]}</span>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${v.cls}`}>
          <v.Icon className="w-2.5 h-2.5" /> {v.label}
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-2">{d.description}</p>
      <pre className="text-[9px] text-zinc-400 mt-1.5 bg-zinc-50 rounded px-1.5 py-1 font-mono truncate">{codeFirst}…</pre>
      <div className="flex items-center justify-between mt-1.5 text-[9px] text-zinc-400">
        <span>{d.inputs.length} input</span>
        {d.rowEffect && <span>{d.rowEffect.inputRows.toLocaleString('it-IT')} → {d.rowEffect.outputRows.toLocaleString('it-IT')} righe</span>}
        <span>{d.outputs.length} output</span>
      </div>
    </NodeShell>
  );
}

export const TransformerNode = React.memo(TransformerNodeImpl);
