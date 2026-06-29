import type { UserSavedQuery } from './types';

// Store localStorage delle query salvate dall'utente (separato dai mock statici).
const KEY = 'datahealth:savedQueries:v1';
const MAX_USER_SAVED = 100;

export function listSaved(): UserSavedQuery[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserSavedQuery[]) : [];
  } catch {
    return [];
  }
}

function persist(list: UserSavedQuery[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_USER_SAVED)));
  } catch {
    /* quota/storage non disponibile: accettabile nel prototipo */
  }
}

export function addSaved(q: UserSavedQuery): UserSavedQuery {
  const list = listSaved().filter((x) => x.id !== q.id);
  list.unshift(q);
  persist(list);
  return q;
}

export function removeSaved(id: string): void {
  persist(listSaved().filter((x) => x.id !== id));
}

export function updateSaved(id: string, patch: Partial<UserSavedQuery>): void {
  persist(listSaved().map((x) => (x.id === id ? { ...x, ...patch } : x)));
}
