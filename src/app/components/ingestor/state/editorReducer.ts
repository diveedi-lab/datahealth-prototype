import type {
  EditorState, FlowStage, CollectionFileInput, EditorNode,
  SourceFormat, TargetFormat, Transformer, TargetTable, ValidationStatus,
} from '../types';
import { STAGE_ORDER } from '../types';
import { buildNodesFromFiles, sourceSignature } from '../mock/mockData';
import { runAnalysis } from '../mock/mockAnalysis';
import { buildVirtualCollection } from '../mock/mockConversion';

export type EditorAction =
  | { type: 'HYDRATE'; state: EditorState }
  | { type: 'ADD_FILES'; files: CollectionFileInput[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'NODE_MOVE'; id: string; position: { x: number; y: number } }
  | { type: 'MOVE_TRANSFORMER'; id: string; position: { x: number; y: number } }
  | { type: 'MOVE_TARGET'; id: string; position: { x: number; y: number } }
  | { type: 'SET_BUSY'; busy: EditorState['busy'] }
  | { type: 'RUN_ANALYSIS'; at: number }
  | { type: 'DELETE_ANALYSIS' }
  | { type: 'SET_FORMATS'; source: SourceFormat; target: TargetFormat }
  | { type: 'SET_CONVERSION'; transformers: Transformer[]; targetTables: TargetTable[] }
  | { type: 'VALIDATE_TRANSFORMER'; id: string; status: ValidationStatus; message?: string }
  | { type: 'FINALIZE'; at: number }
  | { type: 'ADVANCE'; to: FlowStage }
  | { type: 'GO_TO_STAGE'; to: FlowStage }
  | { type: 'SET_VIEWPORT'; viewport: EditorState['viewport'] };

function maxStage(a: FlowStage, b: FlowStage): FlowStage {
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b;
}

// Riporta uno stadio "non oltre 'analyzed'" (usato quando la conversione viene invalidata)
function clampToAnalyzed(s: FlowStage): FlowStage {
  return STAGE_ORDER.indexOf(s) > STAGE_ORDER.indexOf('analyzed') ? 'analyzed' : s;
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

// Cambiare il set sorgente invalida la conversione a valle (transformer/target/virtual)
function conversionResetOnSourceChange(state: EditorState, uploads: CollectionFileInput[]) {
  const sigChanged = sourceSignature(uploads) !== sourceSignature(state.uploads);
  if (sigChanged && (state.transformers.length > 0 || state.virtual)) {
    return {
      transformers: [] as Transformer[],
      targetTables: [] as TargetTable[],
      virtual: null,
      stage: clampToAnalyzed(state.stage),
      maxStageReached: clampToAnalyzed(state.maxStageReached),
    };
  }
  return {};
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'ADD_FILES': {
      const existing = new Set(state.uploads.map((u) => u.id));
      const uploads = [...state.uploads, ...action.files.filter((f) => !existing.has(f.id))];
      return { ...state, uploads, nodes: rebuildNodes(uploads, state.nodes), ...conversionResetOnSourceChange(state, uploads) };
    }

    case 'REMOVE_FILE': {
      const uploads = state.uploads.filter((u) => u.id !== action.fileId);
      return {
        ...state,
        uploads,
        nodes: rebuildNodes(uploads, state.nodes),
        edges: state.edges.filter((e) => e.source !== action.fileId && e.target !== action.fileId),
        ...conversionResetOnSourceChange(state, uploads),
      };
    }

    case 'NODE_MOVE':
      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, position: action.position } : n)),
      };

    case 'SET_BUSY':
      return { ...state, busy: action.busy };

    // L'analisi gira nel reducer sui nodi correnti (niente stale closure dal componente)
    case 'RUN_ANALYSIS': {
      const r = runAnalysis(state.nodes);
      return {
        ...state,
        nodes: r.nodes,
        edges: r.edges,
        busy: null,
        stage: 'analyzed',
        maxStageReached: maxStage(state.maxStageReached, 'analyzed'),
        analyzedAt: action.at,
        analyzedSignature: sourceSignature(state.uploads),
      };
    }

    case 'DELETE_ANALYSIS':
      return {
        ...state,
        nodes: state.nodes.map((n) => ({ ...n, data: { ...n.data, analyzed: false } })),
        edges: [],
        transformers: [],
        targetTables: [],
        virtual: null,
        analyzedAt: null,
        analyzedSignature: null,
        stage: 'source',
        maxStageReached: 'source',
        busy: null,
      };

    case 'SET_FORMATS':
      return { ...state, meta: { ...state.meta, sourceFormat: action.source, targetFormat: action.target } };

    case 'SET_CONVERSION':
      return { ...state, transformers: action.transformers, targetTables: action.targetTables, virtual: null, busy: null };

    case 'VALIDATE_TRANSFORMER':
      return {
        ...state,
        virtual: null, // il riepilogo finalized non è più valido se cambia una validazione
        transformers: state.transformers.map((t) =>
          t.id === action.id ? { ...t, validation: action.status, validationMessage: action.message ?? t.validationMessage } : t,
        ),
      };

    case 'MOVE_TRANSFORMER':
      return {
        ...state,
        transformers: state.transformers.map((t) => (t.id === action.id ? { ...t, position: action.position } : t)),
      };

    case 'MOVE_TARGET':
      return {
        ...state,
        targetTables: state.targetTables.map((t) => (t.id === action.id ? { ...t, position: action.position } : t)),
      };

    case 'FINALIZE':
      return {
        ...state,
        virtual: buildVirtualCollection(state, action.at),
        busy: null,
        stage: 'finalized',
        maxStageReached: maxStage(state.maxStageReached, 'finalized'),
      };

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
