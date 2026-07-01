import { genId } from '../explore/ids';

export type SharePermission = 'view' | 'write' | 'download' | 'file-access';

export interface Share {
  id: string;
  collections: string[];       // id (catalogo o derivate)
  collectionNames: string[];
  permissions: SharePermission[];
  users: { id: string; name: string; avatar: string }[];
  createdAt: number;
}

const KEY = 'datahealth:shares:v1';
const MAX = 100;

export function listShares(): Share[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Share[]).sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

function persist(list: Share[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { /* noop */ }
}

export function addShare(s: Omit<Share, 'id' | 'createdAt'>): Share {
  const item: Share = { ...s, id: `SH-${genId('s').slice(2)}`, createdAt: Date.now() };
  persist([item, ...listShares()]);
  return item;
}

export function removeShare(id: string): void {
  persist(listShares().filter((s) => s.id !== id));
}
