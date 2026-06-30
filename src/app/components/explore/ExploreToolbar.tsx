import React from 'react';
import { ArrowLeft, Compass, X, Plus, Network, Layers } from 'lucide-react';
import { useExplore } from './state/ExploreContext';
import { getCollection } from './mock/mockCatalog';
import type { StructureRequest } from './types';

export function ExploreTopBar({
  onClose, onOpenStructure, onEditScope,
}: {
  onClose: () => void;
  onOpenStructure: (req: StructureRequest) => void;
  onEditScope: () => void;
}) {
  const { state, dispatch } = useExplore();
  const scope = state.scope.collections;
  const queryCount = Object.values(state.artifacts).filter((a) => a.kind === 'query').length;
  const chartCount = Object.values(state.artifacts).filter((a) => a.kind === 'chart').length;

  return (
    <header className="h-14 shrink-0 bg-white border-b border-zinc-200 grid grid-cols-[1fr_auto_1fr] items-center px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Chat
        </button>
        <div className="h-6 w-px bg-zinc-200 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate leading-tight flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" /> Explore
          </p>
          <p className="text-[11px] text-zinc-400 truncate">{queryCount} query · {chartCount} grafici</p>
        </div>
      </div>

      {/* zona centrale: chip dello scope (click → struttura, × → rimuovi) */}
      <div className="flex items-center gap-1.5 justify-center max-w-[46vw] overflow-x-auto no-scrollbar">
        {scope.map((id) => {
          const c = getCollection(id);
          if (!c) return null;
          return (
            <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-700 shrink-0">
              <button
                onClick={() => onOpenStructure({ mode: 'collection', collectionId: id })}
                className="inline-flex items-center gap-1.5 hover:text-blue-700"
                title="Esplora struttura"
              >
                <span className={`w-2 h-2 rounded-full ${c.dotClass}`} />
                {c.name}
              </button>
              <button onClick={() => dispatch({ type: 'REMOVE_COLLECTION', id })} className="ml-0.5 text-zinc-400 hover:text-zinc-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        <button
          onClick={onEditScope}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-zinc-600 border border-dashed border-zinc-300 hover:bg-zinc-50 shrink-0"
        >
          <Plus className="w-3 h-3" /> Collection
        </button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => scope[0] && onOpenStructure({ mode: 'collection', collectionId: scope[0] })}
          disabled={scope.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 border bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 disabled:opacity-40"
        >
          <Network className="w-4 h-4" /> Esplora struttura
        </button>
      </div>
    </header>
  );
}
