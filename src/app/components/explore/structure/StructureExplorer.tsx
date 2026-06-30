import React, { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, type Node, type NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Database, Search, Table2, Network } from 'lucide-react';
import type { StructureRequest, ExploreTable } from '../types';
import { useExplore } from '../state/ExploreContext';
import { getCollection } from '../mock/mockCatalog';
import { structureNodeTypes } from './structureNodeTypes';
import { buildCollectionErd, buildQueryLineage } from './erdLayout';
import { VariableDistributionPanel } from '../panels/VariableDistributionPanel';
import { SqlBlock } from '../../shared/query';
import { TYPE_ICON } from './typeIcons';

export function StructureExplorer({
  request, onClose,
}: {
  request: StructureRequest;
  onClose: () => void;
}) {
  const { state } = useExplore();
  const [selectedTable, setSelectedTable] = useState<ExploreTable | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const collection = request.mode === 'collection' ? getCollection(request.collectionId) : undefined;
  const query = request.mode === 'query'
    ? (state.artifacts[request.queryId]?.kind === 'query' ? state.artifacts[request.queryId] : undefined)
    : undefined;

  const graph = useMemo(() => {
    if (request.mode === 'collection' && collection) return buildCollectionErd(collection);
    if (request.mode === 'query' && query && query.kind === 'query') return buildQueryLineage(query.query);
    return { nodes: [] as Node[], edges: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, collection, query]);

  const resultSchema = (graph as { resultSchema?: { name: string; columns: string[] }[] }).resultSchema;

  const title = request.mode === 'collection'
    ? `Struttura · ${collection?.name ?? request.collectionId}`
    : `Lineage · ${query?.kind === 'query' ? query.title : 'query'}`;

  const onNodeClick: NodeMouseHandler = (_, node) => {
    const t = (node.data as { table?: ExploreTable })?.table;
    if (t) setSelectedTable(t);
  };

  return (
    <div className="fixed inset-0 z-50 app-backdrop flex flex-col animate-in fade-in duration-150">
      <header className="h-12 shrink-0 flex items-center gap-2 px-4 border-b border-zinc-200">
        {request.mode === 'collection' ? <Database className="w-4 h-4 text-blue-600" /> : <Network className="w-4 h-4 text-violet-600" />}
        <p className="text-sm font-semibold text-zinc-800">{title}</p>
        <span className="text-[11px] text-zinc-400">· {graph.nodes.length} entità</span>
        <button onClick={onClose} className="ml-auto p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100" aria-label="Chiudi">
          <X className="w-5 h-5" />
        </button>
      </header>

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
          {request.mode === 'collection' && collection && (
            <div className="p-4 space-y-4">
              {selectedTable && (
                <div>
                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
                    <Table2 className="w-4 h-4" style={{ color: selectedTable.color }} /> {selectedTable.label}
                  </p>
                  <div className="glass-card rounded-lg divide-y divide-zinc-50">
                    {selectedTable.columns.map((c) => (
                      <div key={c.name} className="flex items-center gap-1.5 px-2.5 py-1.5">
                        {TYPE_ICON[c.type]}
                        <span className="font-mono text-[11px] text-zinc-700 flex-1 truncate">{c.name}</span>
                        {c.pk && <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-amber-100 text-amber-700">PK</span>}
                        {c.fk && <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-blue-100 text-blue-700">FK</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-2">Distribuzioni</p>
                <VariableDistributionPanel collection={collection} />
              </div>
            </div>
          )}

          {request.mode === 'query' && query?.kind === 'query' && (
            <div className="p-4 space-y-3">
              <div className="glass-card rounded-xl px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1"><Search className="w-3 h-3" /> Richiesta</p>
                <p className="text-sm text-zinc-700 italic">“{query.query.prompt}”</p>
              </div>
              <SqlBlock sql={query.query.sql} defaultOpen={false} />
              {resultSchema && resultSchema.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1.5">Schema risultato</p>
                  {resultSchema.map((r) => (
                    <div key={r.name} className="mb-2 glass-card rounded-lg overflow-hidden">
                      <p className="text-xs font-semibold text-zinc-700 bg-zinc-50 px-2.5 py-1.5 border-b border-zinc-100">{r.name}</p>
                      <div className="flex flex-wrap gap-1 p-2">
                        {r.columns.map((c) => (
                          <span key={c} className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600">{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
