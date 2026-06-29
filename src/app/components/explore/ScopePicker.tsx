import React, { useState } from 'react';
import { Search, Check, Database, Compass, Layers, ArrowRight } from 'lucide-react';
import { EXPLORE_COLLECTIONS } from './mock/mockCatalog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';

function CollectionGrid({
  selected, toggle, onExploreStructure, query, setQuery,
}: {
  selected: Set<string>;
  toggle: (id: string) => void;
  onExploreStructure?: (id: string) => void;
  query: string;
  setQuery: (s: string) => void;
}) {
  const filtered = EXPLORE_COLLECTIONS.filter(
    (c) => !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca collection…"
          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtered.map((c) => {
          const active = selected.has(c.id);
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-3 transition-colors ${active ? 'border-blue-400 bg-blue-50/50 ring-1 ring-blue-200' : 'border-zinc-200 hover:border-zinc-300'}`}
            >
              <button onClick={() => toggle(c.id)} className="w-full flex items-start gap-2.5 text-left">
                <span className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border ${active ? 'bg-blue-600 border-blue-600' : 'border-zinc-300 bg-white'}`}>
                  {active && <Check className="w-3.5 h-3.5 text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${c.dotClass}`} />
                    <span className="text-sm font-semibold text-zinc-800 truncate">{c.name}</span>
                  </span>
                  <span className="block text-[11px] text-zinc-400 mt-0.5">{c.tableCount} tabelle · {c.rowsLabel} righe</span>
                  <span className="block text-[11px] text-zinc-500 mt-1 line-clamp-2">{c.description}</span>
                </span>
              </button>
              {onExploreStructure && (
                <button
                  onClick={() => onExploreStructure(c.id)}
                  className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Database className="w-3 h-3" /> esplora struttura
                </button>
              )}
            </div>
          );
        })}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifica lo scope</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto pr-1">
            <CollectionGrid selected={sel} toggle={toggle} onExploreStructure={onExploreStructure} query={query} setQuery={setQuery} />
          </div>
          <DialogFooter>
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

  // landing
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Compass className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Scegli le collection su cui lavorare</h2>
            <p className="text-sm text-zinc-500">Seleziona una o più collection, poi chatta per creare query e grafici.</p>
          </div>
        </div>

        <div className="mt-6">
          <CollectionGrid selected={sel} toggle={toggle} onExploreStructure={onExploreStructure} query={query} setQuery={setQuery} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => onConfirm([...sel])}
            disabled={sel.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium shadow-sm"
          >
            <Layers className="w-4 h-4" /> Inizia a esplorare
          </button>
          <span className="text-xs text-zinc-400">{sel.size} selezionate</span>
        </div>
      </div>
    </div>
  );
}
