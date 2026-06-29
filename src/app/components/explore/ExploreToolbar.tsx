import React from 'react';
import { ArrowLeft, Sparkles, Compass, X, Layers } from 'lucide-react';
import { useExplore } from './state/ExploreContext';
import { getCollection } from './mock/mockCatalog';

export function ExploreToolbar({
  onClose, chatOpen, onToggleChat,
}: {
  onClose: () => void;
  chatOpen: boolean;
  onToggleChat: () => void;
}) {
  const { state, dispatch } = useExplore();
  const scope = state.scope.collections;

  return (
    <header className="h-14 shrink-0 bg-white border-b border-zinc-200 grid grid-cols-[1fr_auto_1fr] items-center px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Query Tool
        </button>
        <div className="h-6 w-px bg-zinc-200 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate leading-tight flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" /> Explore
          </p>
          <p className="text-[11px] text-zinc-400 truncate">
            {Object.keys(state.queries).length} query · {Object.keys(state.charts).length} grafici
          </p>
        </div>
      </div>

      {/* zona centrale: chip dello scope */}
      <div className="flex items-center gap-1.5 justify-center max-w-[46vw] overflow-x-auto no-scrollbar">
        {scope.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 border border-dashed border-zinc-300 rounded-full px-3 py-1">
            <Layers className="w-3.5 h-3.5" /> nessuno scope — scegli una collection o chiedilo in chat
          </span>
        ) : (
          scope.map((id) => {
            const c = getCollection(id);
            if (!c) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-700 shrink-0">
                <span className={`w-2 h-2 rounded-full ${c.dotClass}`} />
                {c.name}
                <button onClick={() => dispatch({ type: 'REMOVE_COLLECTION', id })} className="ml-0.5 text-zinc-400 hover:text-zinc-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0 border ${
            chatOpen ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-violet-700 border-violet-200 hover:bg-violet-50'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Chat AI
        </button>
      </div>
    </header>
  );
}
