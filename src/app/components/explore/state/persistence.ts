import type { ExploreState } from '../types';
import { EXPLORE_SCHEMA_VERSION } from '../types';

const PREFIX = 'datahealth:explore:v1:';
const keyFor = (id: string) => PREFIX + id;
const MAX_CHAT = 40;

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
    // tronca la chat per non far crescere troppo lo storage
    const trimmed: ExploreState = {
      ...state,
      chatLog: state.chatLog.slice(-MAX_CHAT),
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
