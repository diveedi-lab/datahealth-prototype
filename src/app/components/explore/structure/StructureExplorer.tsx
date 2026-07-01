import React, { useEffect } from 'react';
import { X, Database, Network } from 'lucide-react';
import type { StructureRequest, ExploreQuery } from '../types';
import { getCollection } from '../mock/mockCatalog';
import { StructureView } from '../graphical/StructureView';

// Overlay full-screen sopra lo StructureView riusabile.
export function StructureExplorer({
  request, query, onClose,
}: {
  request: StructureRequest;
  query?: ExploreQuery;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const collection = request.mode === 'collection' ? getCollection(request.collectionId) : undefined;
  const title = request.mode === 'collection'
    ? `Struttura · ${collection?.name ?? request.collectionId}`
    : `Lineage · ${query?.title ?? 'query'}`;

  return (
    <div className="fixed inset-0 z-50 app-backdrop flex flex-col animate-in fade-in duration-150">
      <header className="h-12 shrink-0 flex items-center gap-2 px-4 border-b border-zinc-200/70 glass-chrome">
        {request.mode === 'collection' ? <Database className="w-4 h-4 text-blue-600" /> : <Network className="w-4 h-4 text-violet-600" />}
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
        <button onClick={onClose} className="ml-auto p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-500/10" aria-label="Chiudi">
          <X className="w-5 h-5" />
        </button>
      </header>
      <StructureView
        mode={request.mode}
        collectionId={request.mode === 'collection' ? request.collectionId : undefined}
        query={request.mode === 'query' ? query : undefined}
      />
    </div>
  );
}
