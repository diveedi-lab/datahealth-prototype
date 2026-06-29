import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { isStale } from './state/editorReducer';
import { useRunAnalysis } from './hooks/useAnalysis';

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('it-IT', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function AnalysisBanner() {
  const { state, dispatch } = useEditor();
  const run = useRunAnalysis();
  const stale = isStale(state);
  const analyzing = state.busy === 'analyzing';

  if (analyzing) {
    return (
      <Bar tone="info">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>Analisi in corso…</span>
      </Bar>
    );
  }

  if (!state.analyzedAt && !stale) return null;

  if (state.analyzedAt && !stale) {
    return (
      <Bar tone="ok">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Analisi eseguita il <strong>{formatTime(state.analyzedAt)}</strong>. Le fasi a valle sono allineate ai dati sorgente.</span>
        <button onClick={() => dispatch({ type: 'DELETE_ANALYSIS' })} className="ml-auto inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg hover:bg-emerald-100">
          <Trash2 className="w-3.5 h-3.5" /> Cancella analisi
        </button>
      </Bar>
    );
  }

  // stale
  return (
    <Bar tone="warn">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        I dati sorgente sono cambiati dopo l'analisi del <strong>{state.analyzedAt ? formatTime(state.analyzedAt) : '—'}</strong>:
        le fasi successive non sono più allineate.
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        <button onClick={run} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
          <RefreshCw className="w-3.5 h-3.5" /> Rigenera analisi
        </button>
        <button onClick={() => dispatch({ type: 'DELETE_ANALYSIS' })} className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg hover:bg-rose-100">
          <Trash2 className="w-3.5 h-3.5" /> Cancella
        </button>
      </div>
    </Bar>
  );
}

function Bar({ tone, children }: { tone: 'ok' | 'warn' | 'info'; children: React.ReactNode }) {
  const cls =
    tone === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : tone === 'warn' ? 'bg-rose-50 border-rose-200 text-rose-700'
        : 'bg-blue-50 border-blue-200 text-blue-700';
  return (
    <div className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm border-b ${cls}`}>
      {children}
    </div>
  );
}
