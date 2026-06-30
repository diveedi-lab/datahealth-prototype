import React, { useState, useCallback, useEffect } from 'react';
import type { ExploreState, ChartType, StructureRequest, ArtifactRef } from './types';
import { ExploreProvider, useExplore } from './state/ExploreContext';
import { ExploreTopBar } from './ExploreToolbar';
import { ExploreChat } from './chat/ExploreChat';
import { ArtifactPanel } from './artifacts/ArtifactPanel';
import { ScopePicker } from './ScopePicker';
import { StructureExplorer } from './structure/StructureExplorer';
import { getCollection } from './mock/mockCatalog';
import { makeChartFromVariable, makeChartArtifact } from './factory';
import { saveQueryArtifact } from './saveQuery';
import { upsertExploration } from './state/registry';

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

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 900px)');
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return narrow;
}

function WorkspaceShell({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useExplore();
  const needsScope = state.scope.collections.length === 0;
  const narrow = useIsNarrow();

  const [panelW, setPanelW] = useState(620);
  const [structure, setStructure] = useState<StructureRequest | null>(null);
  const [scopeDialog, setScopeDialog] = useState(false);

  const active = state.currentArtifactId ? state.artifacts[state.currentArtifactId] : null;
  const list: ArtifactRef[] = state.artifactOrder
    .map((id) => state.artifacts[id])
    .filter(Boolean)
    .map((a) => ({ id: a.id, kind: a.kind, title: a.title }));

  const select = useCallback((id: string | null) => dispatch({ type: 'SELECT_ARTIFACT', id }), [dispatch]);

  // registra/aggiorna la conversazione nell'indice (lista home), solo se non vuota
  useEffect(() => {
    const firstUser = state.chatLog.find((m) => m.role === 'user')?.text;
    if (state.scope.collections.length === 0 && !firstUser) return;
    const title = (firstUser && firstUser.slice(0, 60))
      || state.scope.collections.map((c) => getCollection(c)?.name ?? c).join(', ')
      || 'Nuova esplorazione';
    upsertExploration({ id: state.id, title, collections: state.scope.collections, at: Date.now() });
  }, [state.chatLog, state.scope.collections, state.id]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelW;
    const onMove = (ev: MouseEvent) => setPanelW(Math.min(960, Math.max(420, startW + (startX - ev.clientX))));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [panelW]);

  // azioni sull'artifact attivo
  const onChangeType = (type: ChartType) => {
    if (active?.kind !== 'chart') return;
    const spec = active.chart.altSpecs?.[type];
    if (spec) dispatch({ type: 'SET_CHART_SPEC', id: active.id, chartType: type, spec });
  };
  const onVisualize = (variable: string) => {
    if (active?.kind !== 'query') return;
    const chart = makeChartFromVariable({
      title: '', variable, source: { kind: 'query', queryId: active.id }, collections: active.query.collections,
    });
    if (chart) dispatch({ type: 'CREATE_ARTIFACT', artifact: makeChartArtifact(chart) });
  };
  const onSave = () => {
    if (active?.kind !== 'query' || active.saved) return;
    const saved = saveQueryArtifact(active);
    dispatch({ type: 'MARK_SAVED', id: active.id, savedId: saved.id });
  };

  const sourceLabel = (() => {
    if (active?.kind !== 'chart') return '';
    const src = active.chart.source;
    if (src.kind === 'query') return state.artifacts[src.queryId]?.title ?? 'query';
    return getCollection(src.collectionId)?.name ?? 'collection';
  })();

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 overflow-hidden">
      <ExploreTopBar onClose={onClose} onOpenStructure={setStructure} onEditScope={() => setScopeDialog(true)} />

      {needsScope ? (
        <ScopePicker
          variant="landing"
          selected={state.scope.collections}
          onConfirm={(collections) => dispatch({ type: 'SET_SCOPE', collections })}
          onExploreStructure={(collectionId) => setStructure({ mode: 'collection', collectionId })}
        />
      ) : (
        <div className="relative flex-1 min-h-0 flex">
          <div className="flex-1 min-w-0 h-full">
            <ExploreChat onOpenArtifact={select} />
          </div>
          {active && (
            <ArtifactPanel
              list={list}
              active={active}
              width={panelW}
              fullScreen={narrow}
              onStartResize={startResize}
              onSelect={select}
              onClose={() => select(null)}
              sourceLabel={sourceLabel}
              onChangeType={onChangeType}
              onVisualize={onVisualize}
              onSave={onSave}
              onOpenStructure={setStructure}
            />
          )}
        </div>
      )}

      {scopeDialog && (
        <ScopePicker
          variant="dialog"
          open={scopeDialog}
          onOpenChange={setScopeDialog}
          selected={state.scope.collections}
          onConfirm={(collections) => { dispatch({ type: 'SET_SCOPE', collections }); setScopeDialog(false); }}
          onExploreStructure={(collectionId) => { setScopeDialog(false); setStructure({ mode: 'collection', collectionId }); }}
        />
      )}

      {structure && <StructureExplorer request={structure} onClose={() => setStructure(null)} />}
    </div>
  );
}
