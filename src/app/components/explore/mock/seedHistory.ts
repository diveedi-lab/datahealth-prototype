import type { ExploreState, ExploreQuery, QueryArtifact, ExploreChatMsg } from '../types';
import { EXPLORE_SCHEMA_VERSION } from '../types';
import { genId } from '../ids';
import { resolveCollectionId, getCollection } from './mockCatalog';
import { buildQueryResult } from './mockResults';
import { makeChartFromVariable, makeChartArtifact } from '../factory';
import { saveExplore } from '../state/persistence';
import { upsertExploration, listExplorations } from '../state/registry';

const SEED_FLAG = 'datahealth:explore:seeded:v1';
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

interface FakeSpec {
  title: string;
  prompt: string;
  databases: string[];
  agoMs: number;
  chartVar?: string;
}

const FAKE: FakeSpec[] = [
  { title: 'Pazienti over 60 con troponina alta', prompt: 'Pazienti over 60 con troponina alta', databases: ['CARDIO-2024'], agoMs: 28 * MIN },
  { title: 'Distribuzione dell’età dei pazienti', prompt: 'Mostra la distribuzione dell’età dei pazienti', databases: ['CARDIO-2024'], agoMs: 2 * HOUR, chartVar: 'age' },
  { title: 'Eventi avversi per gravità', prompt: 'Conteggio degli eventi avversi per gravità', databases: ['CARDIO-2024'], agoMs: 6 * HOUR, chartVar: 'severity' },
  { title: 'Arruolamenti per trimestre', prompt: 'Andamento degli arruolamenti per trimestre', databases: ['CARDIO-2024'], agoMs: DAY, chartVar: 'enrollment_date' },
  { title: 'Coorte ONCO: pazienti attivi', prompt: 'Elenca i pazienti attivi della coorte oncologica', databases: ['ONCO-TRIAL-A'], agoMs: 2 * DAY },
  { title: 'NEURO: gravità eventi avversi', prompt: 'Distribuzione della gravità degli eventi avversi', databases: ['NEURO-PHASE3'], agoMs: 3 * DAY, chartVar: 'severity' },
  { title: 'Valore lab per sito', prompt: 'Confronta il valore di laboratorio per sito', databases: ['CARDIO-2024'], agoMs: 6 * DAY, chartVar: 'site_id' },
];

const WELCOME =
  'Ciao! Scegli le collection su cui lavorare e dimmi cosa cercare: creo query e grafici come artefatti nel pannello a destra.';

function buildFake(spec: FakeSpec, now: number): { id: string; state: ExploreState; collections: string[]; at: number } {
  const id = `exp-seed-${genId('s')}`;
  const collections = Array.from(
    new Set(spec.databases.map((d) => resolveCollectionId(d)).filter(Boolean) as string[]),
  );
  const cols = collections.length ? collections : ['cardio-2024'];
  const at = now - spec.agoMs;

  const r = buildQueryResult(spec.prompt, cols);
  const qid = genId('q');
  const query: ExploreQuery = {
    id: qid, title: spec.title, prompt: spec.prompt, sql: r.sql, collections: cols,
    status: r.status, results: r.results, rowCount: r.rowCount, execMs: r.execMs, createdAt: at,
  };
  const qArt: QueryArtifact = { id: qid, kind: 'query', title: spec.title, createdAt: at, query, saved: false };

  const artifacts: ExploreState['artifacts'] = { [qid]: qArt };
  const order: string[] = [qid];
  let current = qid;

  const chatLog: ExploreChatMsg[] = [
    { id: genId('m'), role: 'assistant', text: WELCOME },
    { id: genId('m'), role: 'user', text: spec.prompt },
    {
      id: genId('m'), role: 'assistant',
      text: `Ecco la query: ${r.rowCount.toLocaleString('it-IT')} righe.`,
      actionsSummary: `Scope → ${cols.map((c) => getCollection(c)?.name ?? c).join(', ')} · query «${spec.title}»`,
      artifactIds: [qid],
    },
  ];

  if (spec.chartVar) {
    const chart = makeChartFromVariable({
      title: '', variable: spec.chartVar, source: { kind: 'query', queryId: qid }, collections: cols,
    });
    if (chart) {
      const cArt = makeChartArtifact(chart);
      artifacts[cArt.id] = cArt;
      order.push(cArt.id);
      current = cArt.id;
      chatLog.push(
        { id: genId('m'), role: 'user', text: `Visualizza ${spec.chartVar}` },
        { id: genId('m'), role: 'assistant', text: 'Ecco il grafico.', artifactIds: [cArt.id] },
      );
    }
  }

  const state: ExploreState = {
    schemaVersion: EXPLORE_SCHEMA_VERSION,
    id,
    scope: { collections: cols, queryId: qid },
    artifacts,
    artifactOrder: order,
    currentArtifactId: current,
    chatLog,
    busy: false,
  };
  return { id, state, collections: cols, at };
}

// Popola una history fittizia al primo accesso (una sola volta, anche se l'utente cancella tutto).
export function seedFakeHistoryIfNeeded(now: number): void {
  try {
    if (localStorage.getItem(SEED_FLAG)) return;
    if (listExplorations().length > 0) { localStorage.setItem(SEED_FLAG, '1'); return; }
    for (const spec of FAKE) {
      const { id, state, collections, at } = buildFake(spec, now);
      saveExplore(id, state);
      upsertExploration({ id, title: spec.title, collections, at });
    }
    localStorage.setItem(SEED_FLAG, '1');
  } catch {
    /* storage non disponibile: nessuna history fittizia */
  }
}
