import React from 'react';
import { X, Sparkles, Table2, ArrowRight } from 'lucide-react';
import type { TargetTable } from '../types';

const FMT_BADGE: Record<TargetTable['format'], string> = {
  cdisc: 'bg-violet-100 text-violet-700',
  omop: 'bg-cyan-100 text-cyan-700',
  fhir: 'bg-emerald-100 text-emerald-700',
};

export function TargetDrillDown({
  target, chatOpen, onToggleChat, onClose,
}: {
  target: TargetTable;
  chatOpen: boolean;
  onToggleChat: () => void;
  onClose: () => void;
}) {
  const t = target;
  const mapped = t.columns.filter((c) => c.mappedFrom).length;
  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="flex items-start gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
        <Table2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: t.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-zinc-900 truncate flex items-center gap-1.5">
            {t.name}
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded uppercase ${FMT_BADGE[t.format]}`}>{t.format}</span>
          </p>
          <p className="text-xs text-zinc-400 truncate">{t.label} · {t.estRowCount.toLocaleString('it-IT')} righe</p>
        </div>
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 border transition-colors ${
            chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-700 border-violet-200 hover:bg-violet-50'
          }`}
          title="Chat AI su questa tabella target"
        >
          <Sparkles className="w-3.5 h-3.5" /> AI
        </button>
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0" aria-label="Chiudi">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        <p className="text-xs text-zinc-500">{mapped}/{t.columns.length} colonne mappate</p>
        <div className="space-y-1.5">
          {t.columns.map((c) => (
            <div key={c.name} className="bg-zinc-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${c.mappedFrom ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
                <span className="font-mono text-xs font-semibold text-zinc-800">{c.name}</span>
                <span className="text-[10px] text-zinc-400">{c.type}</span>
                {c.required && <span className="text-[9px] text-amber-600 font-medium">required</span>}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{c.description}</p>
              {c.mappedFrom && (
                <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-emerald-500" /> <span className="font-mono">{c.mappedFrom}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
