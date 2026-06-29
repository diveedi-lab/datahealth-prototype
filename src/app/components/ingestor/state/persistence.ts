import type { EditorState, FlowStage } from '../types';
import { SCHEMA_VERSION } from '../types';

const PREFIX = 'datahealth:collection-editor:v1:';
const keyFor = (id: string) => PREFIX + id;

export function loadState(id: string): EditorState | null {
  try {
    const raw = localStorage.getItem(keyFor(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EditorState;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(id: string, state: EditorState): void {
  try {
    localStorage.setItem(keyFor(id), JSON.stringify(state));
  } catch {
    /* quota o storage non disponibile: nel prototipo è accettabile */
  }
}

export function clearState(id: string): void {
  try {
    localStorage.removeItem(keyFor(id));
  } catch {
    /* noop */
  }
}

// Usato da DB.tsx per riflettere lo stadio salvato nel badge della card
export function getSavedStage(id: string): FlowStage | null {
  const s = loadState(id);
  return s ? s.stage : null;
}
