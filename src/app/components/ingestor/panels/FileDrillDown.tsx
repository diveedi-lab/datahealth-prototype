import React, { useState, useMemo } from 'react';
import {
  X, Key, Type, Hash, Calendar, ToggleLeft, List as ListIcon,
  AlertTriangle, CheckCircle2, Images, BookOpen, Search, Table, Lock, Sparkles,
} from 'lucide-react';
import type { EditorNode, Variable, VarType } from '../types';
import { DistributionChart } from './DistributionChart';
import { AiChat } from '../AiChat';

const TYPE_ICON: Record<VarType, React.ReactNode> = {
  id: <Key className="w-3.5 h-3.5 text-amber-500" />,
  string: <Type className="w-3.5 h-3.5 text-blue-500" />,
  integer: <Hash className="w-3.5 h-3.5 text-emerald-500" />,
  float: <Hash className="w-3.5 h-3.5 text-teal-500" />,
  date: <Calendar className="w-3.5 h-3.5 text-violet-500" />,
  boolean: <ToggleLeft className="w-3.5 h-3.5 text-pink-500" />,
  categorical: <ListIcon className="w-3.5 h-3.5 text-indigo-500" />,
};

export function FileDrillDown({
  node, showAnalysis, onClose,
}: {
  node: EditorNode;
  showAnalysis: boolean;
  onClose: () => void;
}) {
  const [chat, setChat] = useState(false);
  const d = node.data;
  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200">
      <Header node={node} chatOpen={chat} onToggleChat={() => setChat((c) => !c)} onClose={onClose} />
      <div className="flex-1 overflow-auto min-h-0">
        {chat ? (
          <AiChat
            scope={`${d.label} · ${d.fileName}`}
            hint="Chiedimi di questo elemento: variabili, valori, anomalie o cosa farci."
            suggestions={
              node.type === 'tabularFile'
                ? ['Cosa rappresenta questo file?', 'Ci sono problemi di qualità?', 'Come va convertito?']
                : node.type === 'fileCollection'
                  ? ['Come sono collegate le immagini?', 'Cosa faccio con gli orfani?']
                  : ['A cosa serve questo file di contesto?']
            }
            onClose={() => setChat(false)}
          />
        ) : (
          <>
            {node.type === 'tabularFile' && <TabularBody node={node} showAnalysis={showAnalysis} />}
            {node.type === 'fileCollection' && <CollectionBody node={node} showAnalysis={showAnalysis} />}
            {node.type === 'contextNode' && <ContextBody node={node} />}
          </>
        )}
      </div>
    </div>
  );
}

function Header({
  node, chatOpen, onToggleChat, onClose,
}: {
  node: EditorNode;
  chatOpen: boolean;
  onToggleChat: () => void;
  onClose: () => void;
}) {
  const d = node.data;
  const Icon = node.type === 'fileCollection' ? Images : node.type === 'contextNode' ? BookOpen : Table;
  return (
    <div className="flex items-start gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
      <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: d.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-zinc-900 truncate flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-zinc-400" />{d.label}
        </p>
        <p className="text-xs text-zinc-400 truncate">{d.fileName}</p>
      </div>
      <button
        onClick={onToggleChat}
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 border transition-colors ${
          chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-700 border-violet-200 hover:bg-violet-50'
        }`}
        title="Chat AI su questo elemento"
      >
        <Sparkles className="w-3.5 h-3.5" /> AI
      </button>
      <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 rounded shrink-0" aria-label="Chiudi">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─────────────────────────── TABULAR ───────────────────────────
type TopTab = 'preview' | 'variables';
type SubTab = 'distribution' | 'values' | 'quality';

function TabularBody({ node, showAnalysis }: { node: EditorNode; showAnalysis: boolean }) {
  const vars = node.data.variables ?? [];
  const [topTab, setTopTab] = useState<TopTab>('preview');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>(vars[0]?.name ?? '');
  const [subTab, setSubTab] = useState<SubTab>('distribution');

  const filtered = useMemo(
    () => vars.filter((v) => !query || v.name.toLowerCase().includes(query.toLowerCase()) || v.label.toLowerCase().includes(query.toLowerCase())),
    [vars, query],
  );
  const current = vars.find((v) => v.name === selected) ?? vars[0];

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center gap-3 text-xs text-zinc-500">
        <span>{(node.data.rowCount ?? 0).toLocaleString('it-IT')} righe</span>
        <span>·</span>
        <span>{vars.length} variabili</span>
        {showAnalysis && (
          <span className="ml-auto inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> {Math.round((node.data.completeness ?? 1) * 100)}% completo
          </span>
        )}
      </div>

      {/* top tabs: Anteprima / Variabili */}
      <div className="flex gap-1 m-3 mb-2 bg-zinc-100 p-0.5 rounded-lg">
        {([['preview', 'Anteprima'], ['variables', 'Variabili']] as [TopTab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTopTab(id)}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
              topTab === id ? 'bg-white shadow-sm text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {topTab === 'preview' && <PreviewTable rows={node.data.previewRows} />}

      {topTab === 'variables' && (
        <div>
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca variabile…"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div className="px-2 pb-2 max-h-52 overflow-auto">
            {filtered.map((v) => (
              <button
                key={v.name}
                onClick={() => setSelected(v.name)}
                className={`w-full text-left px-2 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  v.name === current?.name ? 'bg-blue-50' : 'hover:bg-zinc-50'
                }`}
              >
                <span className="shrink-0">{TYPE_ICON[v.type]}</span>
                <span className="font-mono text-xs text-zinc-800 truncate flex-1">{v.name}</span>
                <span className="text-[10px] text-zinc-400">{v.type}</span>
                {v.pk && <Badge text="PK" cls="bg-amber-100 text-amber-700" />}
                {v.fk && <Badge text="FK" cls="bg-blue-100 text-blue-700" />}
                {showAnalysis && (v.issues?.length ?? 0) > 0 && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
              </button>
            ))}
          </div>

          {current && (
            <div className="border-t border-zinc-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                {TYPE_ICON[current.type]}
                <span className="font-mono text-sm font-semibold text-zinc-900">{current.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-zinc-400">{current.type}</span>
              </div>

              {!showAnalysis ? (
                <div className="mt-2 flex items-start gap-2 text-xs text-zinc-500 bg-zinc-50 rounded-lg px-3 py-2.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                  <span>Esegui <strong>Generate Analysis</strong> per descrizione, distribuzione, valori frequenti e qualità di questa variabile. Per ora puoi esplorare i dati grezzi nella tab <strong>Anteprima</strong>.</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-zinc-500 mb-3">{current.description}</p>
                  <div className="flex gap-1 mb-3 bg-zinc-100 p-0.5 rounded-lg">
                    {([['distribution', 'Distribuzione'], ['values', 'Valori'], ['quality', 'Qualità']] as [SubTab, string][]).map(
                      ([id, label]) => (
                        <button
                          key={id}
                          onClick={() => setSubTab(id)}
                          className={`flex-1 text-xs py-1 rounded-md transition-colors ${
                            subTab === id ? 'bg-white shadow-sm text-zinc-900 font-medium' : 'text-zinc-500 hover:text-zinc-700'
                          }`}
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                  {subTab === 'distribution' && <DistributionTab variable={current} />}
                  {subTab === 'values' && <ValuesTab variable={current} />}
                  {subTab === 'quality' && <QualityTab variable={current} />}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewTable({ rows }: { rows?: Array<Record<string, string | number>> }) {
  if (!rows || rows.length === 0) {
    return <p className="px-4 py-6 text-xs text-zinc-400 text-center">Nessuna anteprima disponibile per questo file.</p>;
  }
  const headers = Object.keys(rows[0]);
  return (
    <div className="px-3 pb-3">
      <p className="text-[11px] text-zinc-400 mb-1.5 px-1">Prime {rows.length} righe del file originale</p>
      <div className="overflow-auto border border-zinc-200 rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-zinc-50">
              {headers.map((h) => (
                <th key={h} className="text-left font-mono font-medium text-zinc-600 px-2.5 py-1.5 whitespace-nowrap border-b border-zinc-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-zinc-50/50">
                {headers.map((h) => (
                  <td key={h} className="px-2.5 py-1.5 whitespace-nowrap text-zinc-700 font-mono border-b border-zinc-100">
                    {r[h] === '' || r[h] == null ? <span className="text-zinc-300">∅</span> : String(r[h])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DistributionTab({ variable }: { variable: Variable }) {
  const dist = variable.stats?.distribution ?? { kind: 'none' as const };
  return (
    <div>
      <DistributionChart distribution={dist} />
      {dist.kind === 'numeric' && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Stat label="min" value={dist.min} />
          <Stat label="media" value={dist.mean} />
          <Stat label="mediana" value={dist.median} />
          <Stat label="max" value={dist.max} />
        </div>
      )}
      {dist.kind === 'date' && <p className="text-xs text-zinc-500 mt-2 text-center">{dist.min} → {dist.max}</p>}
    </div>
  );
}

function ValuesTab({ variable }: { variable: Variable }) {
  const s = variable.stats;
  if (!s) return null;
  const maxCount = Math.max(1, ...s.topValues.map((t) => t.count));
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Valori d'esempio</p>
        <div className="flex flex-wrap gap-1.5">
          {s.sampleValues.map((v, i) => (
            <span key={i} className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-700">{String(v)}</span>
          ))}
        </div>
      </div>
      {s.topValues.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Valori più frequenti</p>
          <div className="space-y-1.5">
            {s.topValues.map((t) => (
              <div key={String(t.value)} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-zinc-700 w-24 truncate">{String(t.value)}</span>
                <div className="flex-1 h-3.5 bg-zinc-100 rounded overflow-hidden">
                  <div className="h-full bg-blue-500/80 rounded" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                </div>
                <span className="text-[10px] text-zinc-400 w-12 text-right tabular-nums">{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QualityTab({ variable }: { variable: Variable }) {
  const s = variable.stats;
  if (!s) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="completezza" value={`${Math.round(variable.completeness * 100)}%`} />
        <Stat label="mancanti" value={`${s.missingPct}%`} />
        <Stat label="distinti" value={s.uniqueCount.toLocaleString('it-IT')} />
      </div>
      <div>
        <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Anomalie rilevate</p>
        {(variable.issues?.length ?? 0) === 0 ? (
          <p className="text-xs text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Nessuna anomalia</p>
        ) : (
          <ul className="space-y-1">
            {variable.issues!.map((iss, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{iss}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── COLLECTION ───────────────────────────
function CollectionBody({ node, showAnalysis }: { node: EditorNode; showAnalysis: boolean }) {
  const d = node.data;
  const m = d.match;
  return (
    <div className="px-4 py-3 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="file" value={(d.memberCount ?? 0).toLocaleString('it-IT')} />
        <Stat label="dimensione" value={`${d.totalSizeGB} GB`} />
        <Stat label="tipo" value={d.fileKind ?? '—'} />
        <Stat label="caricamento" value="CLI async" />
      </div>
      <div>
        <p className="text-[11px] font-medium text-zinc-500 mb-1">Pattern di naming</p>
        <p className="font-mono text-xs bg-zinc-100 rounded px-2 py-1 text-zinc-700">{d.namingPattern}</p>
      </div>
      {d.previewFiles && (
        <div>
          <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Anteprima file</p>
          <div className="space-y-0.5 max-h-44 overflow-auto border border-zinc-200 rounded-lg p-2">
            {d.previewFiles.map((f, i) => (
              <p key={i} className="font-mono text-[11px] text-zinc-600 truncate">{f}</p>
            ))}
          </div>
        </div>
      )}
      {showAnalysis && m && (
        <div className="border-t border-zinc-100 pt-3">
          <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Match con i metadati (colonna VS.IMGREF)</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-zinc-900">{Math.round((m.matched / m.total) * 100)}%</span>
            <div className="text-xs text-zinc-500">
              <p className="text-emerald-600">{m.matched.toLocaleString('it-IT')} associati</p>
              <p className="text-amber-600">{m.unmatched.toLocaleString('it-IT')} orfani</p>
            </div>
          </div>
          {m.note && <p className="text-xs text-zinc-500 mb-2">{m.note}</p>}
          <ul className="space-y-1">
            {m.unmatchedExamples.map((ex, i) => (
              <li key={i} className="text-[11px] font-mono text-amber-700 flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{ex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── CONTEXT ───────────────────────────
function ContextBody({ node }: { node: EditorNode }) {
  const d = node.data;
  return (
    <div className="px-4 py-3 space-y-3">
      <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-amber-100 text-amber-700">
        {d.contextType}
      </span>
      <div>
        <p className="text-[11px] font-medium text-zinc-500 mb-1">Ruolo</p>
        <p className="text-sm text-zinc-700">{d.role}</p>
      </div>
      {d.helps && (
        <div>
          <p className="text-[11px] font-medium text-zinc-500 mb-1">Aiuta a interpretare</p>
          <p className="text-sm text-zinc-700">{d.helps}</p>
        </div>
      )}
      {d.previewTable && (
        <div>
          <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Anteprima</p>
          <div className="overflow-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-50">
                  {d.previewTable.headers.map((h) => (
                    <th key={h} className="text-left font-mono font-medium text-zinc-600 px-2.5 py-1.5 whitespace-nowrap border-b border-zinc-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.previewTable.rows.map((r, i) => (
                  <tr key={i} className="even:bg-zinc-50/50">
                    {r.map((c, j) => (
                      <td key={j} className="px-2.5 py-1.5 whitespace-nowrap text-zinc-700 font-mono border-b border-zinc-100">{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {d.previewText && (
        <div>
          <p className="text-[11px] font-medium text-zinc-500 mb-1.5">Anteprima contenuto</p>
          <pre className="text-[11px] text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">{d.previewText}</pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── helpers ───────────────────────────
function Badge({ text, cls }: { text: string; cls: string }) {
  return <span className={`text-[9px] font-medium px-1 py-0.5 rounded shrink-0 ${cls}`}>{text}</span>;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 rounded-lg px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="text-sm font-semibold text-zinc-900 tabular-nums">{value}</p>
    </div>
  );
}
