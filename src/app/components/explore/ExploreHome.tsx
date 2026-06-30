import React, { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search, Trash2, MessageSquare } from 'lucide-react';
import { listExplorations, removeExploration, type ExplorationMeta } from './state/registry';
import { clearExplore } from './state/persistence';
import { getCollection } from './mock/mockCatalog';
import { seedFakeHistoryIfNeeded } from './mock/seedHistory';

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'adesso';
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minuti'} fa`;
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
  const [items, setItems] = useState<ExplorationMeta[]>(() => {
    seedFakeHistoryIfNeeded(Date.now());
    return listExplorations();
  });

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
      <div className="h-12 shrink-0 flex items-center px-4">
        <button onClick={onClose} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Query Tool
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-3xl mx-auto w-full px-6 pb-12">
          {/* header: titolo + Nuova chat (in alto a destra, come Claude) */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Explore</h1>
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Nuova chat
            </button>
          </div>

          {/* search full-width */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca chat…"
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-zinc-400">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium text-zinc-500">{items.length === 0 ? 'Nessuna conversazione' : 'Nessun risultato'}</p>
              <button onClick={onNewChat} className="mt-3 text-sm text-blue-600 font-medium hover:underline">Inizia una nuova chat</button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filtered.map((e) => (
                <div key={e.id} className="group flex items-center gap-3 py-4 cursor-pointer" onClick={() => onOpen(e.id)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-zinc-900 truncate group-hover:text-blue-700 transition-colors">{e.title || 'Nuova esplorazione'}</p>
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
                  </div>
                  <span className="text-sm text-zinc-400 shrink-0">{relativeTime(e.updatedAt)}</span>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); del(e.id); }}
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
