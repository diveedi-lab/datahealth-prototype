import React, { useState } from 'react';
import { ArrowLeft, Network } from 'lucide-react';
import { EXPLORE_COLLECTIONS } from '../mock/mockCatalog';
import { StructureView } from './StructureView';

// Data Explorer grafico stand-alone: scegli una collection → ERD + anteprima dati nei nodi.
export function DataExplorer({
  onBack, initialCollectionId = 'cardio-2024',
}: {
  onBack: () => void;
  initialCollectionId?: string;
}) {
  const [collectionId, setCollectionId] = useState(initialCollectionId);

  return (
    <div className="h-screen w-screen flex flex-col app-backdrop overflow-hidden">
      <header className="h-14 shrink-0 glass-chrome border-b flex items-center px-4 gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-500/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Modalità
        </button>
        <div className="h-6 w-px bg-zinc-200" />
        <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
          <Network className="w-4 h-4 text-blue-600" /> Data Explorer
        </p>
        <div className="ml-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {EXPLORE_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCollectionId(c.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${collectionId === c.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white/60 text-zinc-600 border-zinc-200 hover:bg-zinc-100/60'}`}
            >
              <span className={`w-2 h-2 rounded-full ${c.dotClass}`} /> {c.name}
            </button>
          ))}
        </div>
      </header>

      <StructureView key={collectionId} mode="collection" collectionId={collectionId} />
    </div>
  );
}
