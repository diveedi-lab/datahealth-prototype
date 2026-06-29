import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Database } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { useRunAnalysis } from './hooks/useAnalysis';
import { Stepper } from './Stepper';

export function EditorToolbar({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useEditor();
  const { stage, busy } = state;
  const runAnalysis = useRunAnalysis();

  const hasDatafeed = state.uploads.some((u) => u.bucket === 'datafeed');

  let cta: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean } | null = null;
  if (stage === 'source') {
    cta = busy === 'analyzing'
      ? { label: 'Analisi in corso…', icon: <Loader2 className="w-4 h-4 animate-spin" />, onClick: () => {}, disabled: true }
      : { label: 'Generate Analysis', icon: <Sparkles className="w-4 h-4" />, onClick: runAnalysis, disabled: !hasDatafeed };
  } else if (stage === 'analyzed') {
    cta = { label: 'Generate Conversion', icon: <ArrowRight className="w-4 h-4" />, onClick: () => dispatch({ type: 'ADVANCE', to: 'conversion' }) };
  }

  return (
    <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center gap-4 px-4">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
      >
        <ArrowLeft className="w-4 h-4" /> Collections
      </button>

      <div className="h-6 w-px bg-zinc-200 shrink-0" />

      <div className="min-w-0 shrink-0 max-w-[220px]">
        <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">{state.meta.name}</p>
        <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
          <Database className="w-3 h-3" /> {state.meta.targetDatabase}
        </p>
      </div>

      <div className="flex-1 min-w-0 overflow-x-auto">
        <Stepper />
      </div>

      <div className="shrink-0">
        {cta && (
          <button
            onClick={cta.onClick}
            disabled={cta.disabled}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {cta.icon} {cta.label}
          </button>
        )}
      </div>
    </header>
  );
}
