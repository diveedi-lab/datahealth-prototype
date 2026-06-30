import React, { useMemo, useState } from 'react';
import { ArrowLeft, Compass, Plus, Search, Trash2, MessageSquare } from 'lucide-react';
import { listExplorations, removeExploration, type ExplorationMeta } from './state/registry';
import { clearExplore } from './state/persistence';
import { getCollection } from './mock/mockCatalog';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'adesso';
  if (min < 60) return `${min} min fa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'ora' : 'ore'} fa`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ieri';
  if (d < 7) return `${d} giorni fa`;
  return new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export function ExploreHome({
  onOpen, onNewChat, onClose,
}: {
  onOpen: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ExplorationMeta[]>(() => listExplorations());

  const filtered = useMemo(
    () => items.filter((e) => !query || e.title.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  const del = (id: string) => {
    removeExploration(id);
    clearExplore(id);
    setItems(listExplorations());
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 overflow-hidden">
      <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center px-4 gap-3">
        <button onClick={onClose} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Query Tool
        </button>
        <div className="h-6 w-px bg-zinc-200" />
        <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5"><Compass className="w-4 h-4 text-blue-600" /> Explore</p>
        <button
          onClick={onNewChat}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuova chat
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-3xl mx-auto w-full px-6 py-8">
          <div className="relative mb-5">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca chat…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-zinc-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium text-zinc-500">{items.length === 0 ? 'Nessuna conversazione' : 'Nessun risultato'}</p>
              <p className="text-xs mt-1">Inizia una nuova chat per esplorare le tue collection.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              {filtered.map((e) => (
                <div key={e.id} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 transition-colors">
                  <button onClick={() => onOpen(e.id)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-zinc-900 truncate">{e.title || 'Nuova esplorazione'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {e.collections.slice(0, 3).map((c) => {
                        const coll = getCollection(c);
                        return coll ? (
                          <span key={c} className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${coll.dotClass}`} />{coll.name}
                          </span>
                        ) : null;
                      })}
                      {e.collections.length > 3 && <span className="text-[11px] text-zinc-400">+{e.collections.length - 3}</span>}
                      {e.collections.length === 0 && <span className="text-[11px] text-zinc-300">nessuno scope</span>}
                    </div>
                  </button>
                  <span className="text-xs text-zinc-400 shrink-0">{relativeTime(e.updatedAt)}</span>
                  <button
                    onClick={() => del(e.id)}
                    className="shrink-0 p-1.5 text-zinc-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
