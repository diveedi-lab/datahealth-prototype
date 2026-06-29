import React, { useState, useCallback, useMemo } from 'react';
import { Compass } from 'lucide-react';
import type { ExploreState, ChartType } from './types';
import { ExploreProvider, useExplore } from './state/ExploreContext';
import { ExploreToolbar } from './ExploreToolbar';
import { ExploreCanvas } from './canvas/ExploreCanvas';
import { SourcesPanel } from './panels/SourcesPanel';
import { CollectionDrillDown } from './panels/CollectionDrillDown';
import { QueryDrillDown } from './panels/QueryDrillDown';
import { ChartDrillDown } from './panels/ChartDrillDown';
import { ExploreChat } from './chat/ExploreChat';
import { getCollection } from './mock/mockCatalog';
import { makeChartFromVariable } from './factory';

export function ExploreWorkspace({
  explorationId, seed, onClose,
}: {
  explorationId: string;
  seed?: ExploreState;
  onClose: () => void;
}) {
  return (
    <ExploreProvider explorationId={explorationId} seed={seed}>
      <WorkspaceShell onClose={onClose} />
    </ExploreProvider>
  );
}

function WorkspaceShell({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useExplore();
  const empty = state.scope.collections.length === 0 && Object.keys(state.queries).length === 0;
  const [chatOpen, setChatOpen] = useState(empty);
  const [panelW, setPanelW] = useState(560);

  const selectedId = state.selectedId;
  const select = useCallback((id: string | null) => dispatch({ type: 'SELECT_NODE', id }), [dispatch]);

  const sel = useMemo(() => {
    const id = selectedId;
    if (!id) return null;
    if (state.queries[id]) return { kind: 'query' as const, query: state.queries[id] };
    if (state.charts[id]) return { kind: 'chart' as const, chart: state.charts[id] };
    const c = getCollection(id);
    if (c && state.scope.collections.includes(id)) return { kind: 'collection' as const, collection: c };
    return null;
  }, [selectedId, state.queries, state.charts, state.scope.collections]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelW;
    const onMove = (ev: MouseEvent) => setPanelW(Math.min(920, Math.max(400, startW + (startX - ev.clientX))));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelW]);

  // Crea un grafico da una variabile e lo seleziona
  const visualizeFromCollection = (collectionId: string, variable: string) => {
    const chart = makeChartFromVariable({
      title: '', variable, source: { kind: 'collection', collectionId }, collections: [collectionId],
    });
    if (chart) { dispatch({ type: 'CREATE_CHART', chart }); select(chart.id); }
  };
  const visualizeFromQuery = (queryId: string, collections: string[], variable: string) => {
    const chart = makeChartFromVariable({
      title: '', variable, source: { kind: 'query', queryId }, collections,
    });
    if (chart) { dispatch({ type: 'CREATE_CHART', chart }); select(chart.id); }
  };

  const chartSourceLabel = (s: typeof sel) => {
    if (s?.kind !== 'chart') return '';
    const src = s.chart.source;
    if (src.kind === 'query') return state.queries[src.queryId]?.title ?? 'query';
    return getCollection(src.collectionId)?.name ?? 'collection';
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 overflow-hidden">
      <ExploreToolbar onClose={onClose} chatOpen={chatOpen} onToggleChat={() => setChatOpen((o) => !o)} />

      <div className="flex-1 flex min-h-0">
        <SourcesPanel onSelectCollection={select} />

        <div className="flex-1 min-w-0 relative">
          <ExploreCanvas selectedId={selectedId} onSelect={select} />
          {empty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-sm px-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-700 mb-1">Inizia da una conversazione</p>
                <p className="text-xs text-zinc-400">
                  Scegli le collection dal pannello a sinistra oppure chiedi all’AI di impostare lo scope, creare query e grafici sul canvas.
                </p>
              </div>
            </div>
          )}
        </div>

        {chatOpen && (
          <div className="w-[360px] shrink-0 border-l border-zinc-200 animate-in slide-in-from-right duration-200">
            <ExploreChat onClose={() => setChatOpen(false)} />
          </div>
        )}

        {sel && (
          <div className="shrink-0 flex animate-in slide-in-from-right duration-200" style={{ width: panelW }}>
            <div onMouseDown={startResize} className="w-1.5 shrink-0 cursor-col-resize bg-transparent hover:bg-blue-200 transition-colors" title="Trascina per ridimensionare" />
            <div className="flex-1 min-w-0">
              {sel.kind === 'collection' && (
                <CollectionDrillDown
                  key={sel.collection.id}
                  collection={sel.collection}
                  chatOpen={chatOpen}
                  onToggleChat={() => setChatOpen((c) => !c)}
                  onClose={() => select(null)}
                  onVisualize={(v) => visualizeFromCollection(sel.collection.id, v)}
                />
              )}
              {sel.kind === 'query' && (
                <QueryDrillDown
                  key={sel.query.id}
                  query={sel.query}
                  chatOpen={chatOpen}
                  onToggleChat={() => setChatOpen((c) => !c)}
                  onClose={() => select(null)}
                  onVisualize={(v) => visualizeFromQuery(sel.query.id, sel.query.collections, v)}
                />
              )}
              {sel.kind === 'chart' && (
                <ChartDrillDown
                  key={sel.chart.id}
                  chart={sel.chart}
                  sourceLabel={chartSourceLabel(sel)}
                  chatOpen={chatOpen}
                  onToggleChat={() => setChatOpen((c) => !c)}
                  onClose={() => select(null)}
                  onChangeType={(type: ChartType) => {
                    const spec = sel.chart.altSpecs?.[type];
                    if (spec) dispatch({ type: 'UPDATE_CHART', id: sel.chart.id, patch: { chartType: type, spec } });
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
