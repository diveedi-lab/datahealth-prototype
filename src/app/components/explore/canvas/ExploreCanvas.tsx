import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, MarkerType,
  type Node, type Edge, type NodeChange, type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useExplore } from '../state/ExploreContext';
import { exploreNodeTypes } from './exploreNodeTypes';
import { getCollection } from '../mock/mockCatalog';
import { positionInLane } from '../layout/laneLayout';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function ExploreCanvas({ selectedId, onSelect }: Props) {
  const { state, dispatch } = useExplore();

  // ─── edge logici ───
  const logicalEdges = useMemo(() => {
    const es: { id: string; source: string; target: string; kind: 'scope' | 'derives' }[] = [];
    const collSet = new Set(state.scope.collections);
    for (const q of Object.values(state.queries)) {
      for (const cid of q.collections) {
        if (collSet.has(cid)) es.push({ id: `e-${cid}-${q.id}`, source: cid, target: q.id, kind: 'scope' });
      }
    }
    for (const ch of Object.values(state.charts)) {
      const src = ch.source.kind === 'query' ? ch.source.queryId : ch.source.collectionId;
      const exists = ch.source.kind === 'query' ? !!state.queries[src] : collSet.has(src);
      if (exists) es.push({ id: `e-${src}-${ch.id}`, source: src, target: ch.id, kind: 'derives' });
    }
    return es;
  }, [state.scope.collections, state.queries, state.charts]);

  const connectedIds = useMemo(() => {
    if (!selectedId) return null;
    const set = new Set<string>([selectedId]);
    for (const e of logicalEdges) {
      if (e.source === selectedId) set.add(e.target);
      if (e.target === selectedId) set.add(e.source);
    }
    return set;
  }, [selectedId, logicalEdges]);

  const dimmed = (id: string) => (connectedIds ? !connectedIds.has(id) : false);

  // ─── nodi ───
  const rfNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    state.scope.collections.forEach((cid, i) => {
      const c = getCollection(cid);
      if (!c) return;
      nodes.push({
        id: cid, type: 'collectionNode',
        position: state.positions[cid] ?? positionInLane('collection', i),
        selected: cid === selectedId,
        data: { collection: c, _dimmed: dimmed(cid) },
      });
    });
    Object.values(state.queries).forEach((q, i) => {
      nodes.push({
        id: q.id, type: 'queryNode',
        position: state.positions[q.id] ?? positionInLane('query', i),
        selected: q.id === selectedId,
        data: { query: q, _dimmed: dimmed(q.id) },
      });
    });
    Object.values(state.charts).forEach((ch, i) => {
      nodes.push({
        id: ch.id, type: 'chartNode',
        position: state.positions[ch.id] ?? positionInLane('chart', i),
        selected: ch.id === selectedId,
        data: { chart: ch, _dimmed: dimmed(ch.id) },
      });
    });
    return nodes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.scope.collections, state.queries, state.charts, state.positions, selectedId, connectedIds]);

  const rfEdges: Edge[] = useMemo(
    () => logicalEdges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      animated: e.kind === 'scope',
      markerEnd: { type: MarkerType.ArrowClosed, color: e.kind === 'scope' ? '#818cf8' : '#a78bfa' },
      style: e.kind === 'scope'
        ? { stroke: '#818cf8', strokeWidth: 1.5 }
        : { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '5 4' },
    })),
    [logicalEdges],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const ch of changes) {
        if (ch.type === 'position' && ch.position) {
          dispatch({ type: 'NODE_MOVE', id: ch.id, position: ch.position });
        }
      }
    },
    [dispatch],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => onSelect(node.id), [onSelect]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={exploreNodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onPaneClick={() => onSelect(null)}
      colorMode="light"
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.25}
      maxZoom={1.75}
      proOptions={{ hideAttribution: false }}
    >
      <Background gap={18} color="#e4e4e7" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable nodeColor={() => '#94a3b8'} nodeStrokeWidth={2} maskColor="rgba(244,244,245,0.7)" />
    </ReactFlow>
  );
}
