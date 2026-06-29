import React, { useState } from 'react';
import { Loader2, BarChart3, Table2, Bookmark, BookmarkCheck, Network } from 'lucide-react';
import type { ExploreQuery } from '../types';
import { SqlBlock, ResultTableView } from '../../shared/query';
import { getCollection } from '../mock/mockCatalog';

export function QueryArtifactView({
  query, saved, onVisualize, onSave, onOpenStructure,
}: {
  query: ExploreQuery;
  saved?: boolean;
  onVisualize: (variable: string) => void;
  onSave: () => void;
  onOpenStructure: () => void;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const safeTab = Math.min(activeTab, Math.max(0, query.results.length - 1));
  const result = query.results[safeTab];

  const suggested = query.collections
    .flatMap((cid) => getCollection(cid)?.richVariables ?? [])
    .slice(0, 6);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 pt-3 pb-2 flex items-center gap-2 shrink-0 border-b border-zinc-100">
        <p className="text-xs text-zinc-400 truncate flex-1">
          {query.collections.map((c) => getCollection(c)?.name ?? c).join(', ')}
        </p>
        <button
          onClick={onOpenStructure}
          className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 px-2 py-1 rounded-lg"
        >
          <Network className="w-3.5 h-3.5" /> Struttura
        </button>
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border transition-colors ${saved ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-blue-700 border-blue-200 hover:bg-blue-50'}`}
        >
          {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {saved ? 'Salvata' : 'Salva'}
        </button>
      </div>

      <div className="flex-1 overflow-auto min-h-0 p-3 space-y-3">
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">Richiesta in linguaggio naturale</p>
          <p className="text-sm text-zinc-700 italic">“{query.prompt}”</p>
        </div>

        <SqlBlock sql={query.sql} defaultOpen={false} />

        {query.status === 'running' ? (
          <div className="flex flex-col items-center gap-2 py-10 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs">Esecuzione della query…</p>
          </div>
        ) : query.status === 'empty' ? (
          <p className="text-xs text-amber-600 text-center py-8">La query non ha restituito risultati.</p>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: 380 }}>
            {query.results.length > 1 && (
              <div className="flex items-center overflow-x-auto border-b border-zinc-200 shrink-0">
                {query.results.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${safeTab === i ? 'border-blue-500 text-blue-600 bg-blue-50/50' : 'border-transparent text-zinc-500 hover:bg-zinc-50'}`}
                  >
                    <Table2 className="w-3.5 h-3.5" />{t.name}
                  </button>
                ))}
              </div>
            )}
            {result && <ResultTableView table={result} />}
            <div className="h-9 border-t border-zinc-200 px-3 flex items-center bg-zinc-50/50 text-[11px] text-zinc-500 shrink-0">
              {result && <>Mostro {result.rows.length} di {result.totalRows.toLocaleString('it-IT')} righe · eseguita in {(query.execMs / 1000).toFixed(2)}s</>}
            </div>
          </div>
        )}

        {query.status === 'success' && suggested.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5">Visualizza</p>
            <div className="flex flex-wrap gap-1.5">
              {suggested.map((v) => (
                <button
                  key={v.name}
                  onClick={() => onVisualize(v.name)}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-violet-200 text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <BarChart3 className="w-3 h-3" /> {v.variable.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
