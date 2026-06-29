import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, MarkerType,
  type Node, type Edge, type NodeChange, type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEditor } from '../state/EditorContext';
import { nodeTypes } from './nodeTypes';
import type { FileNodeData } from '../types';

interface FlowCanvasProps {
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

const CONVERSION_STAGES = ['conversion', 'validation', 'finalized'];

export function FlowCanvas({ selectedNodeId, onSelectNode }: FlowCanvasProps) {
  const { state, dispatch } = useEditor();
  const stage = state.stage;
  const conversionMode = CONVERSION_STAGES.includes(stage);
  const showAnalysis = stage !== 'source'; // in Source data niente relazioni/analisi

  // ─── edge logici (dipendono dallo stadio) ───
  const logicalEdges = useMemo(() => {
    if (conversionMode) {
      const es: { id: string; source: string; target: string; kind: string; label?: string }[] = [];
      const nodeIds = new Set(state.nodes.map((n) => n.id));
      const targetIds = new Set(state.targetTables.map((t) => t.id));
      for (const t of state.transformers) {
        // edge solo verso nodi realmente renderizzati (simmetria input/output)
        for (const inp of t.inputs) {
          if (nodeIds.has(inp.fileId)) es.push({ id: `e-${t.id}-in-${inp.fileId}`, source: inp.fileId, target: t.id, kind: 'flow' });
        }
        for (const out of t.outputs) {
          if (targetIds.has(out.targetId)) es.push({ id: `e-${t.id}-out-${out.targetId}`, source: t.id, target: out.targetId, kind: 'flow' });
        }
      }
      return es;
    }
    if (stage === 'source') return [];
    return state.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, kind: e.kind, label: e.label }));
  }, [conversionMode, stage, state.edges, state.nodes, state.transformers, state.targetTables]);

  // ─── dimming dei nodi non connessi al selezionato ───
  const connectedIds = useMemo(() => {
    if (!selectedNodeId || (stage === 'source' && !conversionMode)) return null;
    const set = new Set<string>([selectedNodeId]);
    for (const e of logicalEdges) {
      if (e.source === selectedNodeId) set.add(e.target);
      if (e.target === selectedNodeId) set.add(e.source);
    }
    return set;
  }, [selectedNodeId, logicalEdges, stage, conversionMode]);

  // ─── posizioni delle sorgenti in modalità conversione (corsia sinistra) ───
  const convSources = useMemo(() => {
    if (!conversionMode) return [];
    const ids = new Set<string>();
    state.transformers.forEach((t) => t.inputs.forEach((i) => ids.add(i.fileId)));
    return Array.from(ids);
  }, [conversionMode, state.transformers]);

  // ─── nodi ───
  const rfNodes: Node[] = useMemo(() => {
    if (conversionMode) {
      const sources: Node[] = convSources.map((fid, i) => {
        const n = state.nodes.find((x) => x.id === fid);
        if (!n) return null;
        return {
          id: n.id, type: 'tabularFile', position: { x: 40, y: 60 + i * 150 }, draggable: false,
          selected: n.id === selectedNodeId,
          data: { ...n.data, analyzed: true, _dimmed: connectedIds ? !connectedIds.has(n.id) : false },
        };
      }).filter(Boolean) as Node[];

      const transformers: Node[] = state.transformers.map((t) => ({
        id: t.id, type: 'transformerNode', position: t.position, selected: t.id === selectedNodeId,
        data: { ...t, _dimmed: connectedIds ? !connectedIds.has(t.id) : false },
      }));

      const targets: Node[] = state.targetTables.map((t) => ({
        id: t.id, type: 'targetTable', position: t.position, selected: t.id === selectedNodeId,
        data: { ...t, _mapped: t.columns.filter((c) => c.mappedFrom).length, _dimmed: connectedIds ? !connectedIds.has(t.id) : false },
      }));

      return [...sources, ...transformers, ...targets];
    }

    return state.nodes
      .filter((n) => n.type !== 'contextNode')
      .map((n) => ({
        id: n.id, type: n.type, position: n.position, selected: n.id === selectedNodeId,
        data: { ...n.data, analyzed: n.data.analyzed && showAnalysis, _dimmed: connectedIds ? !connectedIds.has(n.id) : false },
      }));
  }, [conversionMode, convSources, state.nodes, state.transformers, state.targetTables, connectedIds, selectedNodeId, showAnalysis]);

  // ─── edge render ───
  const rfEdges: Edge[] = useMemo(
    () => logicalEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.kind === 'id-match' || e.kind === 'flow',
      markerEnd: e.kind === 'flow' ? { type: MarkerType.ArrowClosed, color: '#818cf8' } : undefined,
      style: e.kind === 'context-link'
        ? { stroke: '#d97706', strokeDasharray: '5 4' }
        : e.kind === 'flow'
          ? { stroke: '#818cf8', strokeWidth: 1.5 }
          : { stroke: '#94a3b8' },
      labelStyle: { fontSize: 10, fill: '#71717a' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
    })),
    [logicalEdges],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const ch of changes) {
        if (ch.type === 'position' && ch.position) {
          if (state.transformers.some((t) => t.id === ch.id)) dispatch({ type: 'MOVE_TRANSFORMER', id: ch.id, position: ch.position });
          else if (state.targetTables.some((t) => t.id === ch.id)) dispatch({ type: 'MOVE_TARGET', id: ch.id, position: ch.position });
          else dispatch({ type: 'NODE_MOVE', id: ch.id, position: ch.position });
        }
      }
    },
    [dispatch, state.transformers, state.targetTables],
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => onSelectNode(node.id), [onSelectNode]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onNodeClick={onNodeClick}
      onPaneClick={() => onSelectNode(null)}
      colorMode="light"
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.25}
      maxZoom={1.75}
      proOptions={{ hideAttribution: false }}
    >
      <Background gap={18} color="#e4e4e7" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => (n.data as FileNodeData)?.color ?? '#818cf8'}
        nodeStrokeWidth={2}
        maskColor="rgba(244,244,245,0.7)"
      />
    </ReactFlow>
  );
}
