import React, { useMemo, useState } from 'react';
import {
  Table2, Images, BookOpen, Plus, X, Terminal, PanelLeftClose, PanelLeftOpen,
  Database, FileUp, Network, ListChecks, AlertTriangle, Link2, GitBranch,
} from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { DEMO_FILES } from './mock/mockData';
import { STAGE_LABEL } from './types';
import type { FileBucket, FlowStage } from './types';

const GROUPS: { bucket: FileBucket; title: string; icon: React.ComponentType<{ className?: string }>; cli?: boolean }[] = [
  { bucket: 'datafeed', title: 'Tabelle (datafeed)', icon: Table2 },
  { bucket: 'file-collection', title: 'File-collection', icon: Images, cli: true },
  { bucket: 'context', title: 'File di contesto', icon: BookOpen },
];

const STAGE_ICON: Record<FlowStage, React.ComponentType<{ className?: string }>> = {
  source: FileUp,
  analyzed: Network,
  conversion: GitBranch,
  validation: ListChecks,
  finalized: Database,
};

// La colonna sinistra cambia contenuto in base allo step corrente (non è uno switcher manuale).
export function LeftPanel({
  selectedId, onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { state } = useEditor();
  const [collapsed, setCollapsed] = useState(false);
  const stage = state.stage;
  const Icon = STAGE_ICON[stage];

  if (collapsed) {
    return (
      <div className="w-12 shrink-0 border-r border-zinc-200 bg-white flex flex-col items-center py-3 gap-3">
        <button onClick={() => setCollapsed(false)} className="p-1.5 text-zinc-500 hover:bg-zinc-100 rounded-lg" aria-label="Apri pannello">
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <Icon className="w-4 h-4 text-zinc-300" />
        <span className="text-[10px] text-zinc-400 [writing-mode:vertical-rl] rotate-180 mt-1">{STAGE_LABEL[stage]}</span>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
      <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-zinc-200">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-zinc-800">{STAGE_LABEL[stage]}</span>
        <button onClick={() => setCollapsed(true)} className="ml-auto p-1 text-zinc-400 hover:bg-zinc-100 rounded-lg" aria-label="Comprimi">
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {stage === 'source' && <SourceTab selectedId={selectedId} onSelect={onSelect} />}
      {stage === 'analyzed' && <AnalysisTab onSelect={onSelect} />}
      {(stage === 'conversion' || stage === 'validation' || stage === 'finalized') && <PlaceholderTab stage={stage} />}
    </div>
  );
}

function SourceTab({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { state, dispatch } = useEditor();
  const addSamples = (bucket: FileBucket) =>
    dispatch({ type: 'ADD_FILES', files: DEMO_FILES.filter((f) => f.bucket === bucket) });

  return (
    <div className="flex-1 overflow-auto p-3 space-y-4">
      {GROUPS.map((g) => {
        const files = state.uploads.filter((u) => u.bucket === g.bucket);
        const Icon = g.icon;
        return (
          <div key={g.bucket}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{g.title}</span>
              {g.cli && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1 py-0.5 rounded bg-zinc-900 text-white">
                  <Terminal className="w-2.5 h-2.5" /> CLI
                </span>
              )}
              <span className="ml-auto text-[10px] text-zinc-400">{files.length}</span>
              <button onClick={() => addSamples(g.bucket)} className="p-0.5 text-blue-600 hover:bg-blue-50 rounded" title="Aggiungi file di esempio">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {files.length === 0 ? (
              <div className="border border-dashed border-zinc-200 rounded-lg py-3 px-2 text-center text-[11px] text-zinc-400">
                Nessun file — usa <span className="text-blue-600">+</span>
              </div>
            ) : (
              <div className="space-y-1">
                {files.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => onSelect(f.id)}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedId === f.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-zinc-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{f.meta} · {f.sizeLabel}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_FILE', fileId: f.id }); if (selectedId === f.id) onSelect(null); }}
                      className="p-0.5 text-zinc-300 hover:text-rose-500 rounded shrink-0 opacity-0 group-hover:opacity-100"
                      aria-label="Rimuovi"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[10px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-100">
        Tabelle e file-collection compaiono come nodi nel canvas. I file di contesto restano qui come
        supporto e non vengono mostrati nel grafo. Clicca un file per l'anteprima.
      </p>
    </div>
  );
}

function AnalysisTab({ onSelect }: { onSelect: (id: string | null) => void }) {
  const { state } = useEditor();
  const tableNodes = state.nodes.filter((n) => n.type === 'tabularFile');
  const totalVars = useMemo(() => tableNodes.reduce((s, n) => s + (n.data.variables?.length ?? 0), 0), [tableNodes]);
  const flags = useMemo(
    () => tableNodes.flatMap((n) => (n.data.variables ?? []).flatMap((v) => (v.issues ?? []).map((iss) => ({ node: n.id, label: n.data.label, varName: v.name, iss })))),
    [tableNodes],
  );
  const nameOf = (id: string) => state.nodes.find((n) => n.id === id)?.data.label ?? id;

  return (
    <div className="flex-1 overflow-auto p-3 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Mini label="tabelle" value={tableNodes.length} />
        <Mini label="variabili" value={totalVars} />
        <Mini label="link" value={state.edges.length} />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" /> Connessioni
        </p>
        {state.edges.length === 0 ? (
          <p className="text-[11px] text-zinc-400">Nessuna connessione (esegui l'analisi).</p>
        ) : (
          <div className="space-y-1">
            {state.edges.map((e) => (
              <div key={e.id} className="flex items-center gap-1.5 text-[11px] text-zinc-600 px-2 py-1.5 bg-zinc-50 rounded-lg">
                <span className="font-mono text-zinc-800">{nameOf(e.source)}</span>
                <span className="text-zinc-300">→</span>
                <span className="font-mono text-zinc-800">{nameOf(e.target)}</span>
                <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 bg-white border border-zinc-200 rounded">{e.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Qualità ({flags.length})
        </p>
        {flags.length === 0 ? (
          <p className="text-[11px] text-emerald-600 flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> Nessuna anomalia rilevata.</p>
        ) : (
          <div className="space-y-1">
            {flags.slice(0, 12).map((f, i) => (
              <button
                key={i}
                onClick={() => onSelect(f.node)}
                className="w-full text-left flex items-start gap-1.5 text-[11px] text-amber-700 px-2 py-1.5 hover:bg-amber-50 rounded-lg"
              >
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <span><span className="font-mono">{f.label}.{f.varName}</span> — {f.iss}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderTab({ stage }: { stage: FlowStage }) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <p className="text-sm text-zinc-500">
        Il pannello <strong>{STAGE_LABEL[stage]}</strong> sarà disponibile nella prossima fase
        (selezione formati, transformer e validazione).
      </p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 rounded-lg px-2 py-1.5 text-center">
      <p className="text-sm font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-zinc-400">{label}</p>
    </div>
  );
}
