import type { ExploreState, ExploreQuery, QueryArtifact } from '../types';
import { EXPLORE_SCHEMA_VERSION } from '../types';
import { genId } from '../ids';
import { resolveCollectionId } from './mockCatalog';
import { buildQueryResult } from './mockResults';

const WELCOME =
  'Ciao! Scegli le collection su cui lavorare e dimmi cosa cercare: creo query e grafici come artefatti nel pannello a destra. Per esempio: «pazienti over 60 con troponina alta» oppure «distribuzione dell’età per sito».';

export function createEmptyExplore(id: string): ExploreState {
  return {
    schemaVersion: EXPLORE_SCHEMA_VERSION,
    id,
    scope: { collections: [], queryId: null },
    artifacts: {},
    artifactOrder: [],
    currentArtifactId: null,
    chatLog: [{ id: genId('m'), role: 'assistant', text: WELCOME }],
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
  const artifact: QueryArtifact = {
    id: qid, kind: 'query', title: opts.title, createdAt: query.createdAt, query, saved: true,
  };

  return {
    schemaVersion: EXPLORE_SCHEMA_VERSION,
    id,
    scope: { collections, queryId: qid },
    artifacts: { [qid]: artifact },
    artifactOrder: [qid],
    currentArtifactId: qid,
    chatLog: [
      { id: genId('m'), role: 'assistant', text: WELCOME },
      {
        id: genId('m'), role: 'assistant',
        text: `Ho aperto «${opts.title}» come artefatto.`,
        actionsSummary: `Scope → ${collections.map((c) => c.toUpperCase()).join(', ')} · query «${opts.title}» (${r.rowCount.toLocaleString('it-IT')} righe)`,
        artifactIds: [qid],
      },
    ],
    busy: false,
  };
}
