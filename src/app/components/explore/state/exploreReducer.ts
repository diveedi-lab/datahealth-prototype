import type { XYPosition } from '@xyflow/react';
import type {
  ExploreState, ExploreQuery, ExploreChart, ExploreChatMsg, QueryStatus, ExploreNodeKind,
} from '../types';
import type { ResultTable } from '../../shared/query';
import { positionInLane, LANE_X, LANE_TOP, LANE_GAP } from '../layout/laneLayout';

// Primo slot verticale libero nella corsia (evita sovrapposizioni dopo le rimozioni,
// quando il conteggio dei nodi non corrisponde più agli indici occupati)
function nextLanePosition(positions: ExploreState['positions'], kind: ExploreNodeKind) {
  const laneX = LANE_X[kind];
  const used = new Set<number>();
  for (const p of Object.values(positions)) {
    if (Math.round(p.x) === laneX) used.add(Math.round((p.y - LANE_TOP) / LANE_GAP));
  }
  let idx = 0;
  while (used.has(idx)) idx++;
  return positionInLane(kind, idx);
}

export type ExploreReducerAction =
  | { type: 'HYDRATE'; state: ExploreState }
  | { type: 'SET_SCOPE'; collections: string[]; queryId?: string | null }
  | { type: 'ADD_COLLECTIONS'; collections: string[] }
  | { type: 'REMOVE_COLLECTION'; id: string }
  | { type: 'CREATE_QUERY'; query: ExploreQuery }
  | { type: 'SET_QUERY_RESULT'; id: string; status: QueryStatus; results: ResultTable[]; rowCount: number; execMs: number }
  | { type: 'CREATE_CHART'; chart: ExploreChart }
  | { type: 'UPDATE_CHART'; id: string; patch: Partial<ExploreChart> }
  | { type: 'REMOVE_NODE'; id: string }
  | { type: 'NODE_MOVE'; id: string; position: XYPosition }
  | { type: 'SELECT_NODE'; id: string | null }
  | { type: 'APPEND_CHAT'; msg: ExploreChatMsg }
  | { type: 'SET_BUSY'; busy: boolean };

function nodeKind(state: ExploreState, id: string): ExploreNodeKind | null {
  if (state.queries[id]) return 'query';
  if (state.charts[id]) return 'chart';
  if (state.scope.collections.includes(id)) return 'collection';
  return null;
}

export function exploreReducer(state: ExploreState, action: ExploreReducerAction): ExploreState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'SET_SCOPE': {
      const collections = Array.from(new Set(action.collections));
      const positions = { ...state.positions };
      for (const id of collections) {
        if (!positions[id]) positions[id] = nextLanePosition(positions, 'collection');
      }
      return {
        ...state,
        scope: { collections, queryId: action.queryId === undefined ? state.scope.queryId : action.queryId },
        positions,
      };
    }

    case 'ADD_COLLECTIONS': {
      const positions = { ...state.positions };
      const collections = [...state.scope.collections];
      for (const id of action.collections) {
        if (collections.includes(id)) continue;
        positions[id] = nextLanePosition(positions, 'collection');
        collections.push(id);
      }
      return { ...state, scope: { ...state.scope, collections }, positions };
    }

    case 'REMOVE_COLLECTION': {
      const positions = { ...state.positions };
      delete positions[action.id];
      return {
        ...state,
        scope: {
          collections: state.scope.collections.filter((c) => c !== action.id),
          queryId: state.scope.queryId,
        },
        positions,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }

    case 'CREATE_QUERY': {
      return {
        ...state,
        queries: { ...state.queries, [action.query.id]: action.query },
        positions: { ...state.positions, [action.query.id]: nextLanePosition(state.positions, 'query') },
      };
    }

    case 'SET_QUERY_RESULT': {
      const q = state.queries[action.id];
      if (!q) return state;
      return {
        ...state,
        queries: {
          ...state.queries,
          [action.id]: {
            ...q, status: action.status, results: action.results,
            rowCount: action.rowCount, execMs: action.execMs,
          },
        },
      };
    }

    case 'CREATE_CHART': {
      return {
        ...state,
        charts: { ...state.charts, [action.chart.id]: action.chart },
        positions: { ...state.positions, [action.chart.id]: nextLanePosition(state.positions, 'chart') },
      };
    }

    case 'UPDATE_CHART': {
      const c = state.charts[action.id];
      if (!c) return state;
      return { ...state, charts: { ...state.charts, [action.id]: { ...c, ...action.patch } } };
    }

    case 'REMOVE_NODE': {
      const kind = nodeKind(state, action.id);
      if (kind === 'collection') {
        return exploreReducer(state, { type: 'REMOVE_COLLECTION', id: action.id });
      }
      const positions = { ...state.positions };
      delete positions[action.id];
      if (kind === 'query') {
        const queries = { ...state.queries };
        delete queries[action.id];
        // rimuovi i chart derivati da questa query
        const charts: Record<string, ExploreChart> = {};
        for (const [cid, ch] of Object.entries(state.charts)) {
          if (ch.source.kind === 'query' && ch.source.queryId === action.id) {
            delete positions[cid];
          } else {
            charts[cid] = ch;
          }
        }
        return {
          ...state, queries, charts, positions,
          selectedId: state.selectedId === action.id ? null : state.selectedId,
        };
      }
      if (kind === 'chart') {
        const charts = { ...state.charts };
        delete charts[action.id];
        return {
          ...state, charts, positions,
          selectedId: state.selectedId === action.id ? null : state.selectedId,
        };
      }
      return state;
    }

    case 'NODE_MOVE':
      return { ...state, positions: { ...state.positions, [action.id]: action.position } };

    case 'SELECT_NODE':
      return { ...state, selectedId: action.id };

    case 'APPEND_CHAT':
      return { ...state, chatLog: [...state.chatLog, action.msg] };

    case 'SET_BUSY':
      return { ...state, busy: action.busy };

    default:
      return state;
  }
}
