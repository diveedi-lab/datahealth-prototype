import type { ExploreState, Artifact } from '../types';
import { EXPLORE_SCHEMA_VERSION } from '../types';

const PREFIX = 'datahealth:explore:v2:';
const keyFor = (id: string) => PREFIX + id;
const MAX_CHAT = 40;
const MAX_ARTIFACTS = 30;

export function loadExplore(id: string): ExploreState | null {
  try {
    const raw = localStorage.getItem(keyFor(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExploreState;
    if (parsed.schemaVersion !== EXPLORE_SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveExplore(id: string, state: ExploreState): void {
  try {
    // tronca chat e artifact per non far crescere troppo lo storage
    // (i result-set delle query sono il payload più pesante)
    let order = state.artifactOrder;
    let artifacts = state.artifacts;
    let currentArtifactId = state.currentArtifactId;
    let chatLog = state.chatLog.slice(-MAX_CHAT);
    if (order.length > MAX_ARTIFACTS) {
      const keep = new Set(order.slice(-MAX_ARTIFACTS));
      // scarta i chart orfani la cui query sorgente è stata potata (coerente col cascade del reducer)
      for (const aid of [...keep]) {
        const art = state.artifacts[aid];
        if (art?.kind === 'chart' && art.chart.source.kind === 'query' && !keep.has(art.chart.source.queryId)) {
          keep.delete(aid);
        }
      }
      order = order.filter((aid) => keep.has(aid));
      const next: Record<string, Artifact> = {};
      for (const aid of order) if (state.artifacts[aid]) next[aid] = state.artifacts[aid];
      artifacts = next;
      if (currentArtifactId && !keep.has(currentArtifactId)) currentArtifactId = order[order.length - 1] ?? null;
      // ripulisci i riferimenti artifact nei messaggi chat
      chatLog = chatLog.map((m) => {
        if (!m.artifactIds) return m;
        const ids = m.artifactIds.filter((id) => keep.has(id));
        return ids.length ? { ...m, artifactIds: ids } : { ...m, artifactIds: undefined };
      });
    }
    const trimmed: ExploreState = {
      ...state,
      artifacts,
      artifactOrder: order,
      currentArtifactId,
      chatLog,
    };
    localStorage.setItem(keyFor(id), JSON.stringify(trimmed));
  } catch {
    /* quota o storage non disponibile: accettabile nel prototipo */
  }
}

export function clearExplore(id: string): void {
  try {
    localStorage.removeItem(keyFor(id));
  } catch {
    /* noop */
  }
}
