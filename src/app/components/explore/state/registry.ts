// Indice delle conversazioni "Explore" (lista alla Claude), persistito in localStorage.
export interface ExplorationMeta {
  id: string;
  title: string;
  collections: string[];
  createdAt: number;
  updatedAt: number;
}

const KEY = 'datahealth:explore:index:v1';
const MAX = 200;

export function listExplorations(): ExplorationMeta[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as ExplorationMeta[]).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function persist(list: ExplorationMeta[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota/storage non disponibile: accettabile nel prototipo */
  }
}

export function upsertExploration(meta: { id: string; title?: string; collections?: string[]; at: number }): void {
  const list = listExplorations();
  const existing = list.find((e) => e.id === meta.id);
  if (existing) {
    existing.title = meta.title ?? existing.title;
    existing.collections = meta.collections ?? existing.collections;
    existing.updatedAt = meta.at;
  } else {
    list.push({
      id: meta.id,
      title: meta.title ?? 'Nuova esplorazione',
      collections: meta.collections ?? [],
      createdAt: meta.at,
      updatedAt: meta.at,
    });
  }
  persist(list);
}

export function removeExploration(id: string): void {
  persist(listExplorations().filter((e) => e.id !== id));
}
