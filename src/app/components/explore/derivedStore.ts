import type { ExploreQuery } from './types';
import type { ResultTable } from '../shared/query';
import { genId } from './ids';
import { buildQueryResult } from './mock/mockResults';

// Collezione DERIVATA: una collection definita da una query su collection esistenti.
export interface DerivedCollection {
  id: string;
  name: string;
  sourceCollections: string[];
  prompt: string;
  sql: string;
  rowCount: number;
  createdAt: number;
  results?: ResultTable[];   // snapshot dei risultati al momento della creazione
  execMs?: number;
}

const KEY = 'datahealth:derived:v1';
const MAX = 100;

export function listDerived(): DerivedCollection[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DerivedCollection[]).sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

function persist(list: DerivedCollection[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch { /* noop */ }
}

export function addDerived(d: Omit<DerivedCollection, 'id' | 'createdAt'>): DerivedCollection {
  const item: DerivedCollection = { ...d, id: `DER-${genId('d').slice(2)}`, createdAt: Date.now() };
  persist([item, ...listDerived()]);
  return item;
}

export function removeDerived(id: string): void {
  persist(listDerived().filter((d) => d.id !== id));
}

// Ricostruisce una ExploreQuery da una collezione derivata (per l'esplorazione grafica/righe).
// Usa i risultati salvati; ricade su buildQueryResult solo per voci vecchie senza snapshot.
export function derivedToQuery(d: DerivedCollection): ExploreQuery {
  const hasStored = !!(d.results && d.results.length);
  const fb = hasStored ? null : buildQueryResult(d.prompt, d.sourceCollections);
  return {
    id: genId('q'),
    title: d.name,
    prompt: d.prompt,
    sql: d.sql || fb?.sql || '',
    collections: d.sourceCollections,
    status: 'success',
    results: hasStored ? d.results! : (fb?.results ?? []),
    rowCount: d.rowCount || fb?.rowCount || 0,
    execMs: d.execMs ?? fb?.execMs ?? 800,
    createdAt: d.createdAt,
  };
}
