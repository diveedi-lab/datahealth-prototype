import React, { useState, useCallback } from 'react';
import { ArrowLeft, GitBranch, Sparkles } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { LeftPanel } from './LeftPanel';
import { FlowCanvas } from './canvas/FlowCanvas';
import { FileDrillDown } from './panels/FileDrillDown';
import { AiChat } from './AiChat';
import type { EditorNode } from './types';

function chatSuggestions(node: EditorNode): string[] {
  if (node.type === 'tabularFile') return ['Cosa rappresenta questo file?', 'Ci sono problemi di qualità?', 'Come va convertito?'];
  if (node.type === 'fileCollection') return ['Come sono collegate le immagini?', 'Cosa faccio con gli orfani?'];
  return ['A cosa serve questo file di contesto?'];
}

export function StageRouter() {
  const { state } = useEditor();
  if (state.stage === 'source' || state.stage === 'analyzed') return <CanvasWorkspace />;
  return <ComingSoon />;
}

function CanvasWorkspace() {
  const { state } = useEditor();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelW, setPanelW] = useState(560);
  const [drawerChat, setDrawerChat] = useState(false);
  const selectedNode = state.nodes.find((n) => n.id === selectedId) ?? null;

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id === null) setDrawerChat(false);
  };

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelW;
    const onMove = (ev: MouseEvent) => setPanelW(Math.min(920, Math.max(400, startW + (startX - ev.clientX))));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelW]);

  return (
    <div className="flex-1 flex min-h-0">
      <LeftPanel selectedId={selectedId} onSelect={select} />

      <div className="flex-1 min-w-0 relative">
        <FlowCanvas selectedNodeId={selectedNode ? selectedId : null} onSelectNode={select} />
        {state.stage === 'source' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm text-xs text-zinc-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Clicca un file per l'anteprima · esegui <strong className="font-medium">Generate Analysis</strong> per relazioni, distribuzioni e qualità
            </div>
          </div>
        )}
      </div>

      {/* secondo drawer: chat AI sull'elemento, affiancata a SINISTRA del drawer di dettaglio */}
      {selectedNode && drawerChat && (
        <div className="w-[340px] shrink-0 border-l border-zinc-200 animate-in slide-in-from-right duration-200">
          <AiChat
            key={selectedNode.id}
            scope={`${selectedNode.data.label} · ${selectedNode.data.fileName}`}
            hint="Chiedimi di questo elemento: variabili, valori, anomalie o cosa farci."
            suggestions={chatSuggestions(selectedNode)}
            onClose={() => setDrawerChat(false)}
          />
        </div>
      )}

      {selectedNode && (
        <div className="shrink-0 flex animate-in slide-in-from-right duration-200" style={{ width: panelW }}>
          <div
            onMouseDown={startResize}
            className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-blue-200 transition-colors"
            title="Trascina per ridimensionare"
          />
          <div className="flex-1 min-w-0">
            <FileDrillDown
              node={selectedNode}
              showAnalysis={state.stage !== 'source' && selectedNode.data.analyzed}
              chatOpen={drawerChat}
              onToggleChat={() => setDrawerChat((c) => !c)}
              onClose={() => select(null)}
            />
          </div>
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
      <h2 className="text-xl font-bold text-zinc-900 mb-1">
        {state.stage === 'conversion' ? 'Conversione verso standard' : 'Fase'} — in arrivo
      </h2>
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
