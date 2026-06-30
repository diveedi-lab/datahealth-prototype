import React, { useState } from 'react';
import type { ExploreCollection } from '../types';
import { DistributionChart } from '../../ingestor/panels/DistributionChart';
import { TYPE_ICON } from '../structure/typeIcons';

// Pannello "variabili + distribuzione" riusabile (estratto da CollectionDrillDown).
export function VariableDistributionPanel({ collection }: { collection: ExploreCollection }) {
  const [selectedVar, setSelectedVar] = useState<string>(collection.richVariables[0]?.name ?? '');
  const current = collection.richVariables.find((v) => v.name === selectedVar) ?? collection.richVariables[0];

  if (collection.richVariables.length === 0) {
    return <p className="text-xs text-zinc-400 text-center py-8">Distribuzioni non disponibili per questa collection.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {collection.richVariables.map((v) => (
          <button
            key={v.name}
            onClick={() => setSelectedVar(v.name)}
            className={`text-[11px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${v.name === current?.name ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
          >
            {TYPE_ICON[v.variable.type]} {v.variable.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            {TYPE_ICON[current.variable.type]}
            <span className="font-mono text-sm font-semibold text-zinc-900">{current.name}</span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">{current.variable.type}</span>
          </div>
          <p className="text-xs text-zinc-500 mb-2">{current.variable.description}</p>
          <DistributionChart distribution={current.variable.stats!.distribution} />
        </div>
      )}
    </div>
  );
}
