import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, Search, Table2, Network, Rows3 } from 'lucide-react';
import type { ExploreTable, ExploreQuery } from '../types';
import { getCollection } from '../mock/mockCatalog';
import { structureNodeTypes } from '../structure/structureNodeTypes';
import { buildCollectionErd, buildQueryLineage } from '../structure/erdLayout';
import { VariableDistributionPanel } from '../panels/VariableDistributionPanel';
import { SqlBlock } from '../../shared/query';
import { TYPE_ICON } from '../structure/typeIcons';

// Anteprima righe (dati/file) di una tabella
function PreviewTable({ rows }: { rows?: Array<Record<string, string | number>> }) {
  if (!rows || rows.length === 0) {
    return <p className="text-xs text-zinc-400 text-center py-4">Nessuna anteprima disponibile.</p>;
  }
  const headers = Object.keys(rows[0]);
  return (
    <div className="overflow-auto border border-zinc-200 rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-zinc-50/80">
            {headers.map((h) => (
              <th key={h} className="text-left font-mono font-medium text-zinc-600 px-2.5 py-1.5 whitespace-nowrap border-b border-zinc-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-zinc-50/50">
              {headers.map((h) => (
                <td key={h} className="px-2.5 py-1.5 whitespace-nowrap text-zinc-700 font-mono border-b border-zinc-100">
                  {r[h] === '' || r[h] == null ? <span className="text-zinc-300">∅</span> : String(r[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Vista strutturale riusabile: ERD di una collection o lineage di una query.
// Dati passati via props (funziona anche fuori dal provider Explore).
export function StructureView({
  mode, collectionId, query,
}: {
  mode: 'collection' | 'query';
  collectionId?: string;
  query?: ExploreQuery;
}) {
  const [selectedTable, setSelectedTable] = useState<ExploreTable | null>(null);
  const collection = mode === 'collection' && collectionId ? getCollection(collectionId) : undefined;

  const graph = useMemo(() => {
    if (mode === 'collection' && collection) return buildCollectionErd(collection);
    if (mode === 'query' && query) return buildQueryLineage(query);
    return { nodes: [] as Node[], edges: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, collection, query]);

  const resultSchema = (graph as { resultSchema?: { name: string; columns: string[] }[] }).resultSchema;

  const onNodeClick: NodeMouseHandler = (_, node) => {
    const t = (node.data as { table?: ExploreTable })?.table;
    if (t) setSelectedTable(t);
  };

  return (
    <div className="flex-1 min-h-0 flex">
      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={structureNodeTypes}
          onNodeClick={onNodeClick}
          colorMode="light"
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.25}
          maxZoom={1.75}
          proOptions={{ hideAttribution: false }}
        >
          <Background gap={18} color="#e4e4e7" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <aside className="w-[360px] shrink-0 overflow-auto glass">
        {mode === 'collection' && collection && (
          <div className="p-4 space-y-4">
            {selectedTable ? (
              <div>
                <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
                  <Table2 className="w-4 h-4" style={{ color: selectedTable.color }} /> {selectedTable.label}
                  <span className="ml-auto text-[11px] text-zinc-400">{selectedTable.rowCount.toLocaleString('it-IT')} righe</span>
                </p>
                <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-50 mb-3">
                  {selectedTable.columns.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5 px-2.5 py-1.5">
                      {TYPE_ICON[c.type]}
                      <span className="font-mono text-[11px] text-zinc-700 flex-1 truncate">{c.name}</span>
                      {c.pk && <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-amber-100 text-amber-700">PK</span>}
                      {c.fk && <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-blue-100 text-blue-700">FK</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5 flex items-center gap-1"><Rows3 className="w-3 h-3" /> Anteprima dati</p>
                <PreviewTable rows={selectedTable.previewRows} />
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-zinc-500 bg-zinc-50/70 rounded-lg px-3 py-2.5">
                <Database className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-400" />
                <span>Clicca una tabella per vederne colonne e <strong>anteprima dei dati</strong>.</span>
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-2">Distribuzioni</p>
              <VariableDistributionPanel collection={collection} />
            </div>
          </div>
        )}

        {mode === 'query' && query && (
          <div className="p-4 space-y-3">
            <div className="bg-zinc-50/70 border border-zinc-200 rounded-xl px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1"><Search className="w-3 h-3" /> Richiesta</p>
              <p className="text-sm text-zinc-700 italic">“{query.prompt}”</p>
            </div>
            <SqlBlock sql={query.sql} defaultOpen={false} />
            {resultSchema && resultSchema.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5 flex items-center gap-1"><Network className="w-3 h-3" /> Schema risultato</p>
                {resultSchema.map((r) => (
                  <div key={r.name} className="mb-2 border border-zinc-200 rounded-lg overflow-hidden">
                    <p className="text-xs font-semibold text-zinc-700 bg-zinc-50/80 px-2.5 py-1.5 border-b border-zinc-100">{r.name}</p>
                    <div className="flex flex-wrap gap-1 p-2">
                      {r.columns.map((c) => (
                        <span key={c} className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600">{c}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {query.results[0] && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5 flex items-center gap-1"><Rows3 className="w-3 h-3" /> Anteprima righe</p>
                <PreviewTable rows={query.results[0].rows} />
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
