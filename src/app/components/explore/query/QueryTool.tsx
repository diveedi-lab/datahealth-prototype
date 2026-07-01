import React, { useState } from 'react';
import {
  ArrowLeft, Sparkles, Play, Loader2, Check, Bookmark, BookmarkCheck, Network, Table2, Database, FolderPlus,
} from 'lucide-react';
import type { ExploreQuery } from '../types';
import { EXPLORE_COLLECTIONS, getCollection } from '../mock/mockCatalog';
import { buildQueryResult } from '../mock/mockResults';
import { buildAiCatalog } from '../applyActions';
import { ResultTableView } from '../../shared/query';
import { StructureExplorer } from '../structure/StructureExplorer';
import { makeQueryArtifact } from '../factory';
import { saveQueryArtifact } from '../saveQuery';
import { genId } from '../ids';

export function QueryTool({
  onBack, derived = false, onCreateDerived,
}: {
  onBack: () => void;
  derived?: boolean;
  onCreateDerived?: (q: ExploreQuery) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['cardio-2024']));
  const [prompt, setPrompt] = useState('');
  const [sql, setSql] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState<ExploreQuery | null>(null);
  const [tab, setTab] = useState(0);
  const [structureOpen, setStructureOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [derivedName, setDerivedName] = useState('');

  const cols = () => (selected.size ? [...selected] : ['cardio-2024']);
  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const writeWithAI = async () => {
    if (!prompt.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/sql', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, catalog: buildAiCatalog() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSql((typeof data?.sql === 'string' && data.sql.trim()) ? data.sql.trim() : buildQueryResult(prompt, cols()).sql);
    } catch {
      setSql(buildQueryResult(prompt, cols()).sql);
    } finally {
      setAiLoading(false);
    }
  };

  const run = () => {
    if (running) return;
    setRunning(true);
    setSaved(false);
    const match = prompt || sql || 'query';
    const r = buildQueryResult(match, cols());
    const q: ExploreQuery = {
      id: genId('q'),
      title: (prompt || 'Query').slice(0, 48),
      prompt: prompt || '(query SQL manuale)',
      sql: sql || r.sql,
      collections: cols(),
      status: r.status,
      results: r.results,
      rowCount: r.rowCount,
      execMs: r.execMs,
      createdAt: Date.now(),
    };
    setTimeout(() => {
      if (!sql) setSql(r.sql);
      if (derived && !derivedName.trim()) setDerivedName((prompt || 'Collezione derivata').slice(0, 40));
      setQuery(q);
      setTab(0);
      setRunning(false);
    }, 500);
  };

  const save = () => {
    if (!query) return;
    saveQueryArtifact(makeQueryArtifact(query));
    setSaved(true);
  };

  const result = query?.results[tab];

  return (
    <div className="h-screen w-screen flex flex-col app-backdrop overflow-hidden">
      <header className="h-14 shrink-0 glass-chrome border-b flex items-center px-4 gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-500/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> {derived ? 'Indietro' : 'Modalità'}
        </button>
        <div className="h-6 w-px bg-zinc-200" />
        <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
          <Table2 className="w-4 h-4 text-blue-600" /> {derived ? 'Nuova collezione derivata' : 'Query assistite'}
        </p>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-4">
          {/* Collection selector */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5">Collection</p>
            <div className="flex flex-wrap gap-1.5">
              {EXPLORE_COLLECTIONS.map((c) => {
                const active = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/60 text-zinc-600 border-zinc-200 hover:bg-zinc-100/60'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dotClass}`} /> {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt + AI assist */}
          <div className="glass-card rounded-2xl p-3">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-violet-500 absolute left-3 top-3" />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descrivi la query in linguaggio naturale… (es. «pazienti over 60 con troponina alta»)"
                rows={2}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent outline-none resize-none placeholder:text-zinc-400"
              />
            </div>
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] text-zinc-400">L'AI genera l'SQL; puoi modificarlo prima di eseguire.</span>
              <button
                onClick={writeWithAI}
                disabled={!prompt.trim() || aiLoading || selected.size === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Scrivi con AI
              </button>
            </div>
          </div>

          {/* SQL editor */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/60">
              <span className="text-sm font-medium text-zinc-700">SQL</span>
              <button
                onClick={run}
                disabled={running || selected.size === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors shadow-sm"
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Esegui
              </button>
            </div>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              spellCheck={false}
              placeholder="-- scrivi o genera l'SQL, poi Esegui"
              className="w-full p-4 text-[13px] leading-relaxed text-zinc-700 bg-zinc-50/50 font-mono resize-none outline-none min-h-[150px]"
            />
          </div>

          {/* Results */}
          {running && !query && (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-xs">Esecuzione…</p>
            </div>
          )}

          {query && !running && (
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center border-b border-zinc-200/60">
                <div className="flex items-center overflow-x-auto flex-1">
                  {query.results.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => setTab(i)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === i ? 'border-blue-500 text-blue-600 bg-blue-50/40' : 'border-transparent text-zinc-500 hover:bg-zinc-100/50'}`}
                    >
                      <Table2 className="w-3.5 h-3.5" />{t.name}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{t.rows.length}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 px-3 shrink-0">
                  <button onClick={() => setStructureOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 transition-colors">
                    <Network className="w-3.5 h-3.5" /> Esplora su React Flow
                  </button>
                  {derived ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={derivedName}
                        onChange={(e) => setDerivedName(e.target.value)}
                        placeholder="Nome collezione"
                        className="w-40 px-2.5 py-1.5 text-xs bg-white/70 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <button
                        onClick={() => onCreateDerived?.({ ...query, title: derivedName.trim() || query.title })}
                        disabled={!derivedName.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Crea
                      </button>
                    </div>
                  ) : (
                    <button onClick={save} disabled={saved} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${saved ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-zinc-600 border-zinc-200 hover:bg-zinc-100/60'}`}>
                      {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}{saved ? 'Salvata' : 'Salva query'}
                    </button>
                  )}
                </div>
              </div>
              {result && <div className="max-h-[420px] overflow-auto"><ResultTableView table={result} /></div>}
              <div className="h-9 border-t border-zinc-200/60 px-4 flex items-center bg-zinc-50/40 text-[11px] text-zinc-500 shrink-0">
                {result && <>Mostro {result.rows.length} di {result.totalRows.toLocaleString('it-IT')} righe · {query.collections.map((c) => getCollection(c)?.name ?? c).join(', ')} · {(query.execMs / 1000).toFixed(2)}s</>}
              </div>
            </div>
          )}

          {!query && !running && (
            <div className="glass-card rounded-2xl py-14 flex flex-col items-center text-zinc-400">
              <Database className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium text-zinc-500">Scrivi una query ed eseguila</p>
              <p className="text-xs mt-1">Descrivi la richiesta e usa «Scrivi con AI», oppure scrivi l'SQL a mano.</p>
            </div>
          )}
        </div>
      </div>

      {structureOpen && query && (
        <StructureExplorer request={{ mode: 'query', queryId: query.id }} query={query} onClose={() => setStructureOpen(false)} />
      )}
    </div>
  );
}
