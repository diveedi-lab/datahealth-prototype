import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sparkles, CheckCircle2, Database, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { LeftPanel } from './LeftPanel';
import { FlowCanvas } from './canvas/FlowCanvas';
import { FileDrillDown } from './panels/FileDrillDown';
import { TransformerDrillDown } from './panels/TransformerDrillDown';
import { TargetDrillDown } from './panels/TargetDrillDown';
import { AiChat } from './AiChat';
import type { EditorNode, Transformer, TargetTable } from './types';

type Selection =
  | { kind: 'file'; node: EditorNode }
  | { kind: 'transformer'; transformer: Transformer }
  | { kind: 'target'; target: TargetTable }
  | null;

export function StageRouter() {
  const { state } = useEditor();
  if (state.stage === 'finalized') return <FinalizedView />;
  return <CanvasWorkspace />;
}

function CanvasWorkspace() {
  const { state } = useEditor();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelW, setPanelW] = useState(560);
  const [drawerChat, setDrawerChat] = useState(false);

  const sel: Selection = useMemo(() => {
    if (!selectedId) return null;
    const f = state.nodes.find((n) => n.id === selectedId);
    if (f) return { kind: 'file', node: f };
    const tr = state.transformers.find((t) => t.id === selectedId);
    if (tr) return { kind: 'transformer', transformer: tr };
    const tg = state.targetTables.find((t) => t.id === selectedId);
    if (tg) return { kind: 'target', target: tg };
    return null;
  }, [selectedId, state.nodes, state.transformers, state.targetTables]);

  const select = (id: string | null) => {
    setSelectedId(id);
    if (id === null) setDrawerChat(false);
  };

  // Cambiando stadio si azzera la selezione: evita drawer/dimming riferiti a elementi non presenti nello stadio
  useEffect(() => {
    setSelectedId(null);
    setDrawerChat(false);
  }, [state.stage]);

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

  const conversionEmpty = state.stage === 'conversion' && state.transformers.length === 0;
  const chatScope = sel
    ? sel.kind === 'file' ? `${sel.node.data.label} · ${sel.node.data.fileName}`
      : sel.kind === 'transformer' ? `transformer ${sel.transformer.title}`
        : `tabella target ${sel.target.name}`
    : '';
  const chatSuggestions = sel?.kind === 'transformer'
    ? ['Spiega questa trasformazione', 'È corretta? Cosa controllo?', 'Come gestisco i casi limite?']
    : sel?.kind === 'target'
      ? ['Quali colonne mancano?', 'Da dove arriva ogni colonna?']
      : sel?.kind === 'file'
        ? ['Cosa rappresenta questo file?', 'Ci sono problemi di qualità?']
        : [];

  return (
    <div className="flex-1 flex min-h-0">
      <LeftPanel selectedId={selectedId} onSelect={select} />

      <div className="flex-1 min-w-0 relative">
        <FlowCanvas selectedNodeId={sel ? selectedId : null} onSelectNode={select} />
        {state.stage === 'source' && (
          <CanvasHint>
            Clicca un file per l'anteprima · esegui <strong className="font-medium">Generate Analysis</strong> per relazioni, distribuzioni e qualità
          </CanvasHint>
        )}
        {conversionEmpty && (
          <CanvasHint>
            Scegli i formati di origine e destinazione nel pannello a sinistra, poi <strong className="font-medium">genera il mapping</strong>
          </CanvasHint>
        )}
      </div>

      {sel && drawerChat && (
        <div className="w-[340px] shrink-0 border-l border-zinc-200 animate-in slide-in-from-right duration-200">
          <AiChat key={selectedId ?? ''} scope={chatScope} hint="Chiedimi di questo elemento e cosa farci." suggestions={chatSuggestions} onClose={() => setDrawerChat(false)} />
        </div>
      )}

      {sel && (
        <div className="shrink-0 flex animate-in slide-in-from-right duration-200" style={{ width: panelW }}>
          <div onMouseDown={startResize} className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-blue-200 transition-colors" title="Trascina per ridimensionare" />
          <div className="flex-1 min-w-0">
            {sel.kind === 'file' && (
              <FileDrillDown
                node={sel.node}
                showAnalysis={state.stage !== 'source' && sel.node.data.analyzed}
                chatOpen={drawerChat}
                onToggleChat={() => setDrawerChat((c) => !c)}
                onClose={() => select(null)}
              />
            )}
            {sel.kind === 'transformer' && (
              <TransformerDrillDown
                transformer={sel.transformer}
                chatOpen={drawerChat}
                onToggleChat={() => setDrawerChat((c) => !c)}
                onClose={() => select(null)}
              />
            )}
            {sel.kind === 'target' && (
              <TargetDrillDown
                target={sel.target}
                chatOpen={drawerChat}
                onToggleChat={() => setDrawerChat((c) => !c)}
                onClose={() => select(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CanvasHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs text-zinc-600">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />{children}
      </div>
    </div>
  );
}

function FinalizedView() {
  const { state, dispatch } = useEditor();
  const v = state.virtual;
  const tname = (id: string) => state.targetTables.find((t) => t.id === id)?.format ?? '';
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-emerald-50"><Database className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Virtual Collection generata</h2>
            <p className="text-sm text-zinc-500">{state.meta.name} → {state.meta.targetDatabase}</p>
          </div>
        </div>

        {v && (
          <>
            <div className="grid grid-cols-3 gap-3 my-6">
              <Card label="Validati" value={v.passed} tone="ok" />
              <Card label="Da rivedere" value={v.warnings} tone="warn" />
              <Card label="Rifiutati" value={v.errors} tone={v.errors ? 'err' : 'muted'} />
            </div>

            <h3 className="text-sm font-semibold text-zinc-800 mb-2">Tabelle finali</h3>
            <div className="space-y-2 mb-6">
              {v.tables.map((tb) => (
                <div key={tb.targetId} className="flex items-center gap-3 glass-card rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono text-sm font-semibold text-zinc-800">{tb.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">{tname(tb.targetId)}</span>
                  <span className="ml-auto text-sm text-zinc-500">{tb.rowCount.toLocaleString('it-IT')} righe</span>
                </div>
              ))}
            </div>

            {v.unmapped.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5" /> Colonne non mappate (droppate)</p>
                {v.unmapped.map((u) => (
                  <p key={u.file} className="text-xs text-amber-700"><span className="font-mono">{u.file}</span>: {u.columns.join(', ')}</p>
                ))}
              </div>
            )}

            <p className="text-xs text-zinc-400 mb-6">
              Sono stati salvati: operazioni di trasformazione, schema del database finale e riferimenti ai file originali.
            </p>
          </>
        )}

        <button
          onClick={() => dispatch({ type: 'GO_TO_STAGE', to: 'validation' })}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Torna alla validazione
        </button>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone: 'ok' | 'warn' | 'err' | 'muted' }) {
  const cls = tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : tone === 'warn' ? 'bg-orange-50 text-orange-700' : tone === 'err' ? 'bg-rose-50 text-rose-700' : 'bg-zinc-50 text-zinc-500';
  return (
    <div className={`rounded-xl px-4 py-3 ${cls}`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
