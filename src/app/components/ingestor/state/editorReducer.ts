import type {
  EditorState, FlowStage, CollectionFileInput, EditorNode, EditorEdge,
  SourceFormat, TargetFormat,
} from '../types';
import { STAGE_ORDER } from '../types';
import { buildNodesFromFiles, sourceSignature } from '../mock/mockData';

export type EditorAction =
  | { type: 'HYDRATE'; state: EditorState }
  | { type: 'ADD_FILES'; files: CollectionFileInput[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'NODE_MOVE'; id: string; position: { x: number; y: number } }
  | { type: 'SET_BUSY'; busy: EditorState['busy'] }
  | { type: 'SET_ANALYSIS'; nodes: EditorNode[]; edges: EditorEdge[]; at: number }
  | { type: 'DELETE_ANALYSIS' }
  | { type: 'SET_FORMATS'; source: SourceFormat; target: TargetFormat }
  | { type: 'ADVANCE'; to: FlowStage }
  | { type: 'GO_TO_STAGE'; to: FlowStage }
  | { type: 'SET_VIEWPORT'; viewport: EditorState['viewport'] };

function maxStage(a: FlowStage, b: FlowStage): FlowStage {
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b;
}

// Ricostruisce i nodi dai file sorgente preservando posizioni e flag di analisi esistenti
function rebuildNodes(uploads: CollectionFileInput[], prev: EditorNode[]): EditorNode[] {
  const built = buildNodesFromFiles(uploads);
  const posById = new Map(prev.map((n) => [n.id, n.position]));
  const analyzedById = new Map(prev.map((n) => [n.id, n.data.analyzed]));
  return built.map((n) => ({
    ...n,
    position: posById.get(n.id) ?? n.position,
    data: { ...n.data, analyzed: analyzedById.get(n.id) ?? false },
  }));
}

// L'analisi è "stale" se i dati sorgente sono cambiati dopo averla eseguita
export function isStale(state: EditorState): boolean {
  return state.analyzedSignature != null && state.analyzedSignature !== sourceSignature(state.uploads);
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ADD_FILES': {
      const existing = new Set(state.uploads.map((u) => u.id));
      const uploads = [...state.uploads, ...action.files.filter((f) => !existing.has(f.id))];
      return { ...state, uploads, nodes: rebuildNodes(uploads, state.nodes) };
    }

    case 'REMOVE_FILE': {
      const uploads = state.uploads.filter((u) => u.id !== action.fileId);
      return {
        ...state,
        uploads,
        nodes: rebuildNodes(uploads, state.nodes),
        edges: state.edges.filter((e) => e.source !== action.fileId && e.target !== action.fileId),
      };
    }

    case 'NODE_MOVE':
      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, position: action.position } : n)),
      };

    case 'SET_BUSY':
      return { ...state, busy: action.busy };

    case 'SET_ANALYSIS':
      return {
        ...state,
        nodes: action.nodes,
        edges: action.edges,
        busy: null,
        stage: 'analyzed',
        maxStageReached: maxStage(state.maxStageReached, 'analyzed'),
        analyzedAt: action.at,
        analyzedSignature: sourceSignature(state.uploads),
      };

    case 'DELETE_ANALYSIS':
      return {
        ...state,
        nodes: state.nodes.map((n) => ({ ...n, data: { ...n.data, analyzed: false } })),
        edges: [],
        analyzedAt: null,
        analyzedSignature: null,
        stage: 'source',
        maxStageReached: 'source',
        busy: null,
      };

    case 'SET_FORMATS':
      return { ...state, meta: { ...state.meta, sourceFormat: action.source, targetFormat: action.target } };

    case 'ADVANCE':
      return { ...state, stage: action.to, maxStageReached: maxStage(state.maxStageReached, action.to) };

    case 'GO_TO_STAGE':
      return { ...state, stage: action.to };

    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };

    default:
      return state;
  }
}
