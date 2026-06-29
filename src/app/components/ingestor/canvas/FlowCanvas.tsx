import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
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

export function FlowCanvas({ selectedNodeId, onSelectNode }: FlowCanvasProps) {
  const { state, dispatch } = useEditor();

  // Insieme dei nodi connessi al selezionato (per il dimming degli altri)
  const connectedIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const set = new Set<string>([selectedNodeId]);
    for (const e of state.edges) {
      if (e.source === selectedNodeId) set.add(e.target);
      if (e.target === selectedNodeId) set.add(e.source);
    }
    return set;
  }, [selectedNodeId, state.edges]);

  const rfNodes: Node[] = useMemo(
    () => state.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      selected: n.id === selectedNodeId,
      data: { ...n.data, _dimmed: connectedIds ? !connectedIds.has(n.id) : false },
    })),
    [state.nodes, connectedIds, selectedNodeId],
  );

  const rfEdges: Edge[] = useMemo(
    () => state.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: e.kind === 'id-match',
      style: e.kind === 'context-link'
        ? { stroke: '#d97706', strokeDasharray: '5 4' }
        : { stroke: '#94a3b8' },
      labelStyle: { fontSize: 10, fill: '#71717a' },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
    })),
    [state.edges],
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

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const d = node.data as FileNodeData;
      if (d.analyzed) onSelectNode(node.id);
    },
    [onSelectNode],
  );

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
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.3}
      maxZoom={1.75}
      proOptions={{ hideAttribution: false }}
    >
      <Background gap={18} color="#e4e4e7" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => (n.data as FileNodeData)?.color ?? '#94a3b8'}
        nodeStrokeWidth={2}
        maskColor="rgba(244,244,245,0.7)"
      />
    </ReactFlow>
  );
}
