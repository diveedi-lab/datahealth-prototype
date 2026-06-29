import type {
  EditorState, FlowStage, CollectionFileInput, EditorNode, EditorEdge,
  SourceFormat, TargetFormat,
} from '../types';
import { STAGE_ORDER } from '../types';

export type EditorAction =
  | { type: 'HYDRATE'; state: EditorState }
  | { type: 'ADD_FILES'; files: CollectionFileInput[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'SET_NODES'; nodes: EditorNode[] }
  | { type: 'NODE_MOVE'; id: string; position: { x: number; y: number } }
  | { type: 'SET_BUSY'; busy: EditorState['busy'] }
  | { type: 'SET_ANALYSIS'; nodes: EditorNode[]; edges: EditorEdge[] }
  | { type: 'SET_FORMATS'; source: SourceFormat; target: TargetFormat }
  | { type: 'ADVANCE'; to: FlowStage }
  | { type: 'GO_TO_STAGE'; to: FlowStage }
  | { type: 'SET_VIEWPORT'; viewport: EditorState['viewport'] };

function maxStage(a: FlowStage, b: FlowStage): FlowStage {
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b;
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ADD_FILES': {
      const existing = new Set(state.uploads.map((u) => u.id));
      const merged = [...state.uploads, ...action.files.filter((f) => !existing.has(f.id))];
      return { ...state, uploads: merged };
    }

    case 'REMOVE_FILE':
      return { ...state, uploads: state.uploads.filter((u) => u.id !== action.fileId) };

    case 'SET_NODES':
      return { ...state, nodes: action.nodes };

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
      };

    case 'SET_FORMATS':
      return {
        ...state,
        meta: { ...state.meta, sourceFormat: action.source, targetFormat: action.target },
      };

    case 'ADVANCE':
      return {
        ...state,
        stage: action.to,
        maxStageReached: maxStage(state.maxStageReached, action.to),
      };

    case 'GO_TO_STAGE':
      return { ...state, stage: action.to };

    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport };

    default:
      return state;
  }
}
