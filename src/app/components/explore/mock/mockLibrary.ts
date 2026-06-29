import type { ExploreState, ExploreQuery } from '../types';
import { EXPLORE_SCHEMA_VERSION } from '../types';
import { genId } from '../ids';
import { resolveCollectionId } from './mockCatalog';
import { buildQueryResult } from './mockResults';
import { positionInLane } from '../layout/laneLayout';

const WELCOME =
  'Ciao! Sono l’assistente di esplorazione. Dimmi su quali collection vuoi lavorare e cosa cercare: imposterò lo scope, creerò query e grafici sul canvas. Per esempio: «lavora su CARDIO-2024» oppure «pazienti over 60 con troponina alta».';

export function createEmptyExplore(id: string): ExploreState {
  return {
    schemaVersion: EXPLORE_SCHEMA_VERSION,
    id,
    scope: { collections: [], queryId: null },
    queries: {},
    charts: {},
    positions: {},
    chatLog: [{ id: genId('m'), role: 'assistant', text: WELCOME }],
    selectedId: null,
    busy: false,
  };
}

// Costruisce un workspace popolato a partire da una saved query / voce di history
export function buildExploreFromSaved(
  id: string,
  opts: { prompt: string; databases: string[]; title: string },
): ExploreState {
  const resolved = Array.from(
    new Set(opts.databases.map((d) => resolveCollectionId(d)).filter(Boolean) as string[]),
  );
  const collections = resolved.length ? resolved : ['cardio-2024'];

  const positions: ExploreState['positions'] = {};
  collections.forEach((cid, i) => { positions[cid] = positionInLane('collection', i); });

  const r = buildQueryResult(opts.prompt, collections);
  const qid = genId('q');
  const query: ExploreQuery = {
    id: qid,
    title: opts.title,
    prompt: opts.prompt,
    sql: r.sql,
    collections,
    status: r.status,
    results: r.results,
    rowCount: r.rowCount,
    execMs: r.execMs,
    createdAt: Date.now(),
  };
  positions[qid] = positionInLane('query', 0);

  return {
    schemaVersion: EXPLORE_SCHEMA_VERSION,
    id,
    scope: { collections, queryId: qid },
    queries: { [qid]: query },
    charts: {},
    positions,
    chatLog: [
      { id: genId('m'), role: 'assistant', text: WELCOME },
      {
        id: genId('m'), role: 'assistant',
        text: `Ho aperto «${opts.title}» nel workspace.`,
        actionsSummary: `Scope → ${collections.map((c) => c.toUpperCase()).join(', ')} · query «${opts.title}» (${r.rowCount.toLocaleString('it-IT')} righe)`,
      },
    ],
    selectedId: null,
    busy: false,
  };
}
