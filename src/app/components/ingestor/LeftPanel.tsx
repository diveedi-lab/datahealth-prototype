import React, { useMemo, useState } from 'react';
import {
  Table2, Images, BookOpen, Plus, X, Terminal, PanelLeftClose, PanelLeftOpen,
  Database, FileUp, Network, ListChecks, AlertTriangle, Link2, GitBranch,
} from 'lucide-react';
import { useEditor } from './state/EditorContext';
import { DEMO_FILES } from './mock/mockData';
import { generateConversion } from './mock/mockConversion';
import { SOURCE_FORMATS, TARGET_FORMATS } from './formatCatalog';
import { STAGE_LABEL } from './types';
import type { FileBucket, FlowStage, SourceFormat, TargetFormat, ValidationStatus } from './types';
import { Wand2, CheckCircle2, Clock, XCircle, RotateCcw, Sparkles } from 'lucide-react';

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
      {stage === 'conversion' && <ConversionTab selectedId={selectedId} onSelect={onSelect} />}
      {stage === 'validation' && <ValidationTab selectedId={selectedId} onSelect={onSelect} />}
      {stage === 'finalized' && <FinalizedTab />}
    </div>
  );
}

const VAL_ICON: Record<ValidationStatus, { Icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  pending: { Icon: Clock, cls: 'text-amber-500' },
  validated: { Icon: CheckCircle2, cls: 'text-emerald-500' },
  rejected: { Icon: XCircle, cls: 'text-rose-500' },
  'needs-review': { Icon: RotateCcw, cls: 'text-orange-500' },
};

function ConversionTab({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { state, dispatch } = useEditor();
  const src = (state.meta.sourceFormat ?? 'redcap') as SourceFormat;
  const tgt = (state.meta.targetFormat ?? 'cdisc') as TargetFormat;

  // Il mapping demo è precalcolato per i file di esempio (DEMOG/VS/LB/INCL)
  const canConvert = state.uploads.some((u) => ['f-demog', 'f-vs', 'f-lb', 'f-incl'].includes(u.id));
  const setFormats = (s: SourceFormat, t: TargetFormat) => dispatch({ type: 'SET_FORMATS', source: s, target: t });
  const generate = () => {
    if (!canConvert) return;
    setFormats(src, tgt);
    const conv = generateConversion(tgt);
    dispatch({ type: 'SET_CONVERSION', transformers: conv.transformers, targetTables: conv.targetTables });
  };

  return (
    <div className="flex-1 overflow-auto p-3 space-y-4">
      <div className="space-y-2">
        <Field label="Formato di origine">
          <select value={src} onChange={(e) => setFormats(e.target.value as SourceFormat, tgt)} className="w-full text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/40">
            {SOURCE_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </Field>
        <Field label="Formato di destinazione">
          <select value={tgt} onChange={(e) => setFormats(src, e.target.value as TargetFormat)} className="w-full text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500/40">
            {TARGET_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </Field>
      </div>

      <button
        onClick={generate}
        disabled={!canConvert}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium"
      >
        <Sparkles className="w-3.5 h-3.5" /> {state.transformers.length ? 'Rigenera mapping' : 'Genera mapping'}
      </button>
      {!canConvert && (
        <p className="text-[10px] text-zinc-400">
          Il mapping di esempio è disponibile per la collection demo (DEMOG/VS/LB/INCL).
        </p>
      )}

      {state.transformers.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-1.5 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" /> Transformer ({state.transformers.length})
          </p>
          <div className="space-y-1">
            {state.transformers.map((t) => {
              const vi = VAL_ICON[t.validation];
              return (
                <button key={t.id} onClick={() => onSelect(t.id)} className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${selectedId === t.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-zinc-50'}`}>
                  <vi.Icon className={`w-3.5 h-3.5 shrink-0 ${vi.cls}`} />
                  <span className="text-xs text-zinc-700 truncate flex-1">{t.title}</span>
                  <span className="text-[9px] uppercase text-zinc-400">{t.kind}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationTab({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const { state } = useEditor();
  const total = state.transformers.length;
  const done = state.transformers.filter((t) => t.validation === 'validated').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto p-3 space-y-4">
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-zinc-500">Validazione transformer</span>
          <span className="font-medium text-zinc-700">{done}/{total}</span>
        </div>
        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-1">
        {state.transformers.map((t) => {
          const vi = VAL_ICON[t.validation];
          return (
            <button key={t.id} onClick={() => onSelect(t.id)} className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${selectedId === t.id ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-zinc-50'}`}>
              <vi.Icon className={`w-4 h-4 shrink-0 ${vi.cls}`} />
              <span className="text-xs text-zinc-700 truncate flex-1">{t.title}</span>
            </button>
          );
        })}
      </div>

      {done === total && total > 0 ? (
        <p className="text-[11px] text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tutti i transformer sono validati: puoi generare la Virtual Collection.</p>
      ) : (
        <p className="text-[11px] text-zinc-400">Apri ogni transformer e confermalo (Valida) per abilitare la generazione.</p>
      )}
    </div>
  );
}

function FinalizedTab() {
  const { state } = useEditor();
  const v = state.virtual;
  return (
    <div className="flex-1 overflow-auto p-3 space-y-3">
      <p className="text-[11px] text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Virtual Collection generata.</p>
      {v && (
        <div className="grid grid-cols-3 gap-2">
          <Mini label="tabelle" value={v.tables.length} />
          <Mini label="validati" value={v.passed} />
          <Mini label="warning" value={v.warnings} />
        </div>
      )}
      <p className="text-[10px] text-zinc-400">Il riepilogo completo è nell'area centrale.</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-zinc-500 mb-1">{label}</p>
      {children}
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

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 rounded-lg px-2 py-1.5 text-center">
      <p className="text-sm font-bold text-zinc-900 tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-zinc-400">{label}</p>
    </div>
  );
}
