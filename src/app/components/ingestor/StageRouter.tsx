import React, { useState } from 'react';
import { ArrowLeft, GitBranch, Sparkles } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { UploadStage } from './upload/UploadStage';
import { FlowCanvas } from './canvas/FlowCanvas';
import { FileDrillDown } from './panels/FileDrillDown';

export function StageRouter() {
  const { state } = useEditor();
  if (state.stage === 'upload') return <UploadStage />;
  if (state.stage === 'base' || state.stage === 'analyzed') return <CanvasView />;
  return <ComingSoon />;
}

function CanvasView() {
  const { state } = useEditor();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = state.nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 min-w-0 relative">
        <FlowCanvas selectedNodeId={selectedNode ? selectedId : null} onSelectNode={setSelectedId} />
        {state.stage === 'base' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm text-xs text-zinc-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Esegui <strong className="font-medium">Generate Analysis</strong> per attivare il drill-down dei file
            </div>
          </div>
        )}
      </div>
      {selectedNode && (
        <div className="w-[380px] shrink-0 animate-in slide-in-from-right duration-200">
          <FileDrillDown node={selectedNode} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}

function ComingSoon() {
  const { state, dispatch } = useEditor();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="p-4 rounded-2xl bg-blue-50 mb-4">
        <GitBranch className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-zinc-900 mb-1">Conversione verso standard — in arrivo</h2>
      <p className="text-sm text-zinc-500 max-w-md mb-6">
        Qui sceglierai formato di origine e target (OMOP / CDISC / FHIR) e vedrai la mappa N:N con i
        nodi <strong>transformer</strong> (input a sinistra, output a destra, descrizione + codice) e la
        chat AI per validare ogni trasformazione. Arriva nella prossima fase.
      </p>
      <button
        onClick={() => dispatch({ type: 'GO_TO_STAGE', to: 'analyzed' })}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Torna all'analisi
      </button>
    </div>
  );
}
