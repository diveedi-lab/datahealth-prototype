import React, { useState } from 'react';
import { Database, Check, Search, Layers } from 'lucide-react';
import { useExplore } from '../state/ExploreContext';
import { EXPLORE_COLLECTIONS } from '../mock/mockCatalog';

export function SourcesPanel({ onSelectCollection }: { onSelectCollection: (id: string) => void }) {
  const { state, dispatch } = useExplore();
  const [query, setQuery] = useState('');
  const inScope = new Set(state.scope.collections);

  const filtered = EXPLORE_COLLECTIONS.filter(
    (c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()),
  );

  const toggle = (id: string) => {
    if (inScope.has(id)) dispatch({ type: 'REMOVE_COLLECTION', id });
    else dispatch({ type: 'ADD_COLLECTIONS', collections: [id] });
  };

  return (
    <div className="w-64 shrink-0 border-r border-zinc-200 bg-white flex flex-col min-h-0">
      <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-zinc-200">
        <Layers className="w-4 h-4 text-blue-600" />
        <p className="text-sm font-semibold text-zinc-800">Sorgenti</p>
        <span className="ml-auto text-[11px] text-zinc-400">{inScope.size} nello scope</span>
      </div>

      <div className="p-2.5 border-b border-zinc-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca collection…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1.5">
        {filtered.map((c) => {
          const active = inScope.has(c.id);
          return (
            <div
              key={c.id}
              className={`rounded-lg border transition-colors ${active ? 'border-blue-200 bg-blue-50/50' : 'border-zinc-200 hover:bg-zinc-50'}`}
            >
              <button
                onClick={() => toggle(c.id)}
                className="w-full flex items-start gap-2.5 px-2.5 py-2 text-left"
              >
                <span className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 bg-white'}`}>
                  {active && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dotClass}`} />
                    <span className="text-xs font-semibold text-zinc-800 truncate">{c.name}</span>
                  </span>
                  <span className="block text-[10px] text-zinc-400 mt-0.5">
                    {c.tableCount} tabelle · {c.rowsLabel} righe
                  </span>
                </span>
              </button>
              {active && (
                <button
                  onClick={() => onSelectCollection(c.id)}
                  className="w-full text-left px-2.5 pb-2 -mt-0.5 text-[11px] text-blue-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Database className="w-3 h-3" /> esplora tabelle e variabili
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-6">Nessuna collection trovata.</p>
        )}
      </div>
    </div>
  );
}
