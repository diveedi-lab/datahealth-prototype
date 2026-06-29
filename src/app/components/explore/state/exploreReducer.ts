import type {
  ExploreState, Artifact, ExploreChatMsg, QueryStatus, ChartType, ChartSpec,
} from '../types';
import type { ResultTable } from '../../shared/query';

export type ExploreReducerAction =
  | { type: 'HYDRATE'; state: ExploreState }
  | { type: 'SET_SCOPE'; collections: string[]; queryId?: string | null }
  | { type: 'ADD_COLLECTIONS'; collections: string[] }
  | { type: 'REMOVE_COLLECTION'; id: string }
  | { type: 'CREATE_ARTIFACT'; artifact: Artifact; select?: boolean }
  | { type: 'UPDATE_QUERY_RESULT'; id: string; status: QueryStatus; results: ResultTable[]; rowCount: number; execMs: number; sql?: string }
  | { type: 'SET_CHART_SPEC'; id: string; chartType: ChartType; spec: ChartSpec }
  | { type: 'REMOVE_ARTIFACT'; id: string }
  | { type: 'SELECT_ARTIFACT'; id: string | null }
  | { type: 'MARK_SAVED'; id: string; savedId: string }
  | { type: 'APPEND_CHAT'; msg: ExploreChatMsg }
  | { type: 'SET_BUSY'; busy: boolean };

export function exploreReducer(state: ExploreState, action: ExploreReducerAction): ExploreState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'SET_SCOPE': {
      const collections = Array.from(new Set(action.collections));
      return {
        ...state,
        scope: { collections, queryId: action.queryId === undefined ? state.scope.queryId : action.queryId },
      };
    }

    case 'ADD_COLLECTIONS': {
      const collections = [...state.scope.collections];
      for (const id of action.collections) if (!collections.includes(id)) collections.push(id);
      return { ...state, scope: { ...state.scope, collections } };
    }

    case 'REMOVE_COLLECTION':
      return {
        ...state,
        scope: {
          collections: state.scope.collections.filter((c) => c !== action.id),
          queryId: state.scope.queryId,
        },
      };

    case 'CREATE_ARTIFACT': {
      const artifacts = { ...state.artifacts, [action.artifact.id]: action.artifact };
      const artifactOrder = [...state.artifactOrder, action.artifact.id];
      return {
        ...state,
        artifacts,
        artifactOrder,
        currentArtifactId: action.select === false ? state.currentArtifactId : action.artifact.id,
      };
    }

    case 'UPDATE_QUERY_RESULT': {
      const a = state.artifacts[action.id];
      if (!a || a.kind !== 'query') return state;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          [action.id]: {
            ...a,
            query: {
              ...a.query,
              status: action.status,
              results: action.results,
              rowCount: action.rowCount,
              execMs: action.execMs,
              sql: action.sql ?? a.query.sql,
            },
          },
        },
      };
    }

    case 'SET_CHART_SPEC': {
      const a = state.artifacts[action.id];
      if (!a || a.kind !== 'chart') return state;
      return {
        ...state,
        artifacts: {
          ...state.artifacts,
          [action.id]: { ...a, chart: { ...a.chart, chartType: action.chartType, spec: action.spec } },
        },
      };
    }

    case 'REMOVE_ARTIFACT': {
      const removed = state.artifacts[action.id];
      if (!removed) return state;
      const toRemove = new Set<string>([action.id]);
      // cascade: rimuovendo una query elimina i grafici derivati da essa
      if (removed.kind === 'query') {
        for (const [id, art] of Object.entries(state.artifacts)) {
          if (art.kind === 'chart' && art.chart.source.kind === 'query' && art.chart.source.queryId === action.id) {
            toRemove.add(id);
          }
        }
      }
      const artifacts: Record<string, Artifact> = {};
      for (const [id, art] of Object.entries(state.artifacts)) if (!toRemove.has(id)) artifacts[id] = art;
      const artifactOrder = state.artifactOrder.filter((id) => !toRemove.has(id));
      const currentArtifactId = state.currentArtifactId && toRemove.has(state.currentArtifactId)
        ? (artifactOrder[artifactOrder.length - 1] ?? null)
        : state.currentArtifactId;
      return { ...state, artifacts, artifactOrder, currentArtifactId };
    }

    case 'SELECT_ARTIFACT':
      return { ...state, currentArtifactId: action.id };

    case 'MARK_SAVED': {
      const a = state.artifacts[action.id];
      if (!a || a.kind !== 'query') return state;
      return {
        ...state,
        artifacts: { ...state.artifacts, [action.id]: { ...a, saved: true, savedId: action.savedId } },
      };
    }

    case 'APPEND_CHAT':
      return { ...state, chatLog: [...state.chatLog, action.msg] };

    case 'SET_BUSY':
      return { ...state, busy: action.busy };

    default:
      return state;
  }
}
