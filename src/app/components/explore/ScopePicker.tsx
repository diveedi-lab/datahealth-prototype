import React, { useMemo, useState } from 'react';
import { Search, Check, Database, Compass, ArrowRight } from 'lucide-react';
import { EXPLORE_COLLECTIONS } from './mock/mockCatalog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';

// Lista cercabile e selezionabile (scala a decine di collection).
function CollectionList({
  selected, toggle, onExploreStructure, query, setQuery, maxH = 360,
}: {
  selected: Set<string>;
  toggle: (id: string) => void;
  onExploreStructure?: (id: string) => void;
  query: string;
  setQuery: (s: string) => void;
  maxH?: number;
}) {
  const filtered = useMemo(
    () => EXPLORE_COLLECTIONS.filter(
      (c) => !query
        || c.name.toLowerCase().includes(query.toLowerCase())
        || c.description.toLowerCase().includes(query.toLowerCase())
        || c.targetDB.toLowerCase().includes(query.toLowerCase()),
    ),
    [query],
  );
  return (
    <>
      <div className="relative mb-2">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca tra le collection…"
          autoFocus
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
      <div className="glass-card rounded-xl overflow-auto divide-y divide-zinc-50" style={{ maxHeight: maxH }}>
        {filtered.map((c) => {
          const active = selected.has(c.id);
          return (
            <div key={c.id} className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${active ? 'bg-blue-50/60' : 'hover:bg-zinc-50'}`}>
              <button onClick={() => toggle(c.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                <span className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 bg-white'}`}>
                  {active && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.dotClass}`} />
                <span className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-zinc-800 truncate block">{c.name}</span>
                  <span className="text-[11px] text-zinc-400 truncate block">{c.tableCount} tabelle · {c.rowsLabel} righe · {c.targetDB}</span>
                </span>
              </button>
              {onExploreStructure && (
                <button
                  onClick={() => onExploreStructure(c.id)}
                  className="shrink-0 p-1.5 text-zinc-400 hover:text-blue-600 rounded-lg hover:bg-white"
                  title="Esplora struttura"
                >
                  <Database className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-xs text-zinc-400 text-center py-8">Nessuna collection trovata.</p>}
      </div>
    </>
  );
}

export function ScopePicker({
  variant, open, onOpenChange, selected, onConfirm, onExploreStructure,
}: {
  variant: 'landing' | 'dialog';
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  selected: string[];
  onConfirm: (collections: string[]) => void;
  onExploreStructure?: (collectionId: string) => void;
}) {
  const [sel, setSel] = useState<Set<string>>(new Set(selected));
  const [query, setQuery] = useState('');
  const toggle = (id: string) => setSel((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  if (variant === 'dialog') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Collection nello scope</DialogTitle>
          </DialogHeader>
          <CollectionList selected={sel} toggle={toggle} onExploreStructure={onExploreStructure} query={query} setQuery={setQuery} maxH={380} />
          <DialogFooter>
            <span className="text-xs text-zinc-400 mr-auto self-center">{sel.size} selezionate</span>
            <button
              onClick={() => onConfirm([...sel])}
              disabled={sel.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium"
            >
              Conferma <ArrowRight className="w-4 h-4" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // landing (nuova chat)
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Su quali collection vuoi lavorare?</h2>
            <p className="text-sm text-zinc-500">Cerca e seleziona una o più collection, poi inizia a chattare.</p>
          </div>
        </div>

        <CollectionList selected={sel} toggle={toggle} onExploreStructure={onExploreStructure} query={query} setQuery={setQuery} maxH={420} />

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => onConfirm([...sel])}
            disabled={sel.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium shadow-sm"
          >
            Inizia a esplorare <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-400">{sel.size} selezionate</span>
        </div>
      </div>
    </div>
  );
}
