import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Database } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { buildNodesFromFiles } from './mock/mockData';
import { runAnalysis } from './mock/mockAnalysis';
import { STAGE_ORDER, type FlowStage } from './types';

const STAGE_LABEL: Record<FlowStage, string> = {
  upload: 'Upload',
  base: 'Canvas',
  analyzed: 'Analisi',
  conversion: 'Conversione',
  validation: 'Validazione',
  finalized: 'Virtual Collection',
};

export function EditorToolbar({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useEditor();
  const { stage, busy } = state;

  const hasDatafeed = state.uploads.some((u) => u.bucket === 'datafeed');
  const maxIdx = STAGE_ORDER.indexOf(state.maxStageReached);

  const proceedToCanvas = () => {
    dispatch({ type: 'SET_NODES', nodes: buildNodesFromFiles(state.uploads) });
    dispatch({ type: 'ADVANCE', to: 'base' });
  };

  const analyze = () => {
    dispatch({ type: 'SET_BUSY', busy: 'analyzing' });
    const nodes = state.nodes;
    setTimeout(() => {
      const result = runAnalysis(nodes);
      dispatch({ type: 'SET_ANALYSIS', nodes: result.nodes, edges: result.edges });
    }, 1100);
  };

  let cta: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean } | null = null;
  if (stage === 'upload') {
    cta = { label: 'Vai al canvas', icon: <ArrowRight className="w-4 h-4" />, onClick: proceedToCanvas, disabled: !hasDatafeed };
  } else if (stage === 'base') {
    cta = busy === 'analyzing'
      ? { label: 'Analisi in corso…', icon: <Loader2 className="w-4 h-4 animate-spin" />, onClick: () => {}, disabled: true }
      : { label: 'Generate Analysis', icon: <Sparkles className="w-4 h-4" />, onClick: analyze };
  } else if (stage === 'analyzed') {
    cta = { label: 'Generate Conversion', icon: <ArrowRight className="w-4 h-4" />, onClick: () => dispatch({ type: 'ADVANCE', to: 'conversion' }) };
  }

  return (
    <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center gap-4 px-4">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Collections
      </button>

      <div className="h-6 w-px bg-zinc-200" />

      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate leading-tight">{state.meta.name}</p>
        <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
          <Database className="w-3 h-3" /> {state.meta.targetDatabase}
        </p>
      </div>

      {/* stepper degli stadi */}
      <div className="hidden lg:flex items-center gap-1 mx-auto">
        {STAGE_ORDER.map((s, i) => {
          const reached = i <= maxIdx;
          const current = s === stage;
          return (
            <React.Fragment key={s}>
              {i > 0 && <span className={`w-5 h-px ${reached ? 'bg-zinc-300' : 'bg-zinc-200'}`} />}
              <button
                disabled={i > maxIdx}
                onClick={() => dispatch({ type: 'GO_TO_STAGE', to: s })}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  current ? 'bg-blue-600 text-white font-medium'
                    : reached ? 'text-zinc-600 hover:bg-zinc-100'
                      : 'text-zinc-300 cursor-not-allowed'
                }`}
              >
                {STAGE_LABEL[s]}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="ml-auto lg:ml-0">
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
