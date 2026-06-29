import type { Dispatch } from 'react';
import type { ExploreState, ChartSource, Artifact } from './types';
import type { ExploreReducerAction } from './state/exploreReducer';
import type {
  ExploreAction, CreateQueryAction, CreateChartAction, CreateAnalysisAction, SaveQueryAction,
} from './actions';
import { CHART_TYPES, ANALYSIS_TYPES } from './actions';
import { EXPLORE_COLLECTIONS, resolveCollectionId, getCollection } from './mock/mockCatalog';
import { CROSS_PAIRS } from './mock/mockCrossDist';
import {
  makeRunningQuery, resolveQueryResult, makeChartFromVariable, makeChartFromAnalysis,
  makeQueryArtifact, makeChartArtifact,
} from './factory';
import { saveQueryArtifact } from './saveQuery';

// ─── Catalogo compatto da passare a Claude per il grounding ───
export function buildAiCatalog() {
  return {
    collections: EXPLORE_COLLECTIONS.map((c) => ({
      id: c.id,
      name: c.name,
      tables: c.tables.map((t) => ({ name: t.name, columns: t.columns.map((col) => col.name) })),
      variables: c.richVariables.map((v) => ({ name: v.name, label: v.variable.label, table: v.table })),
    })),
    chartTypes: CHART_TYPES,
    analysisTypes: ANALYSIS_TYPES,
    // coppie con dati incrociati disponibili (per grouped/stacked/scatter/crosstab)
    crossPairs: CROSS_PAIRS,
  };
}

const KNOWN_IDS = new Set(EXPLORE_COLLECTIONS.map((c) => c.id));

function resolveIds(tokens: unknown): string[] {
  if (!Array.isArray(tokens)) return [];
  const out: string[] = [];
  for (const t of tokens) {
    if (typeof t !== 'string') continue;
    const id = KNOWN_IDS.has(t) ? t : resolveCollectionId(t);
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

// ─── Validazione/normalizzazione delle azioni AI ───
export function sanitizeActions(raw: unknown): ExploreAction[] {
  if (!Array.isArray(raw)) return [];
  const out: ExploreAction[] = [];
  for (const a of raw) {
    if (!a || typeof a !== 'object') continue;
    const type = (a as { type?: string }).type;
    switch (type) {
      case 'set_scope': {
        const collections = resolveIds((a as any).collections);
        if (collections.length) out.push({ type: 'set_scope', collections });
        break;
      }
      case 'add_to_scope': {
        const collections = resolveIds((a as any).collections);
        if (collections.length) out.push({ type: 'add_to_scope', collections });
        break;
      }
      case 'remove_from_scope': {
        const collections = resolveIds((a as any).collections);
        if (collections.length) out.push({ type: 'remove_from_scope', collections });
        break;
      }
      case 'create_query': {
        const x = a as Partial<CreateQueryAction>;
        if (typeof x.prompt === 'string' && x.prompt.trim()) {
          out.push({
            type: 'create_query',
            title: typeof x.title === 'string' && x.title.trim() ? x.title : x.prompt.slice(0, 40),
            prompt: x.prompt,
            collections: resolveIds(x.collections),
            variables: Array.isArray(x.variables) ? x.variables.filter((v) => typeof v === 'string') : undefined,
          });
        }
        break;
      }
      case 'create_chart': {
        const x = a as Partial<CreateChartAction>;
        if (typeof x.variable === 'string' && x.variable.trim()) {
          out.push({
            type: 'create_chart',
            title: typeof x.title === 'string' ? x.title : '',
            chartType: CHART_TYPES.includes(x.chartType as any) ? (x.chartType as any) : 'bar',
            variable: x.variable,
            groupBy: typeof x.groupBy === 'string' ? x.groupBy : undefined,
            secondVariable: typeof x.secondVariable === 'string' ? x.secondVariable : undefined,
            source: x.source,
          });
        }
        break;
      }
      case 'create_analysis': {
        const x = a as Partial<CreateAnalysisAction>;
        if (ANALYSIS_TYPES.includes(x.analysis as any) && Array.isArray(x.variables) && x.variables.length) {
          out.push({
            type: 'create_analysis',
            title: typeof x.title === 'string' ? x.title : '',
            analysis: x.analysis as any,
            variables: x.variables.filter((v) => typeof v === 'string'),
            source: x.source,
          });
        }
        break;
      }
      case 'save_query': {
        const x = a as Partial<SaveQueryAction>;
        const vis = x.visibility;
        out.push({
          type: 'save_query',
          targetId: typeof x.targetId === 'string' ? x.targetId : undefined,
          name: typeof x.name === 'string' ? x.name : undefined,
          visibility: vis === 'team' || vis === 'public' ? vis : 'private',
        });
        break;
      }
      case 'answer':
        if (typeof (a as any).text === 'string') out.push({ type: 'answer', text: (a as any).text });
        break;
      case 'explain':
        if (typeof (a as any).text === 'string') out.push({ type: 'explain', text: (a as any).text, targetId: (a as any).targetId });
        break;
      default:
        break;
    }
  }
  return out;
}

// ─── Applicazione delle azioni al reducer ───
export function applyActions(
  actions: ExploreAction[],
  ctx: { state: ExploreState; dispatch: Dispatch<ExploreReducerAction> },
): { summary: string; replyText: string; artifactIds: string[] } {
  const { state, dispatch } = ctx;
  const parts: string[] = [];
  const replies: string[] = [];
  const artifactIds: string[] = [];

  let workingCollections = [...state.scope.collections];
  let lastQueryId: string | null = state.scope.queryId;
  // artifact creati in questo batch (non ancora nello state closure)
  const createdArtifacts: Record<string, Artifact> = {};

  const queryArtifactById = (id: string): Artifact | undefined =>
    createdArtifacts[id] ?? (state.artifacts[id]?.kind === 'query' ? state.artifacts[id] : undefined);

  const collectionsOf = (queryId: string): string[] => {
    const art = queryArtifactById(queryId);
    return art && art.kind === 'query' ? art.query.collections : workingCollections;
  };

  const ensureInScope = (ids: string[]) => {
    const missing = ids.filter((id) => !workingCollections.includes(id));
    if (missing.length) {
      dispatch({ type: 'ADD_COLLECTIONS', collections: missing });
      workingCollections = [...workingCollections, ...missing];
    }
  };

  const resolveSource = (provided: ChartSource | undefined): { source: ChartSource; collections: string[] } | null => {
    if (provided) {
      if (provided.kind === 'query' && queryArtifactById(provided.queryId)) {
        return { source: provided, collections: collectionsOf(provided.queryId) };
      }
      if (provided.kind === 'collection' && KNOWN_IDS.has(provided.collectionId)) {
        ensureInScope([provided.collectionId]);
        return { source: provided, collections: [provided.collectionId] };
      }
      // sorgente esplicita ma non risolvibile → non rimbalzare su una sorgente diversa
      return null;
    }
    if (lastQueryId && queryArtifactById(lastQueryId)) {
      return { source: { kind: 'query', queryId: lastQueryId }, collections: collectionsOf(lastQueryId) };
    }
    if (workingCollections.length) {
      return { source: { kind: 'collection', collectionId: workingCollections[0] }, collections: [workingCollections[0]] };
    }
    return null;
  };

  for (const a of actions) {
    switch (a.type) {
      case 'set_scope': {
        dispatch({ type: 'SET_SCOPE', collections: a.collections, queryId: a.queryId ?? null });
        workingCollections = [...a.collections];
        parts.push(`Scope → ${a.collections.map((c) => getCollection(c)?.name ?? c).join(', ')}`);
        break;
      }
      case 'add_to_scope': {
        ensureInScope(a.collections);
        parts.push(`+ ${a.collections.map((c) => getCollection(c)?.name ?? c).join(', ')}`);
        break;
      }
      case 'remove_from_scope': {
        for (const id of a.collections) dispatch({ type: 'REMOVE_COLLECTION', id });
        workingCollections = workingCollections.filter((c) => !a.collections.includes(c));
        parts.push(`− ${a.collections.map((c) => getCollection(c)?.name ?? c).join(', ')}`);
        break;
      }
      case 'create_query': {
        const cols = a.collections && a.collections.length ? a.collections : workingCollections;
        ensureInScope(cols);
        const q = makeRunningQuery(a.title, a.prompt, cols.length ? cols : ['cardio-2024']);
        const artifact = makeQueryArtifact(q);
        dispatch({ type: 'CREATE_ARTIFACT', artifact });
        // rende questa query la "query attiva" dello scope (default per i turni successivi)
        dispatch({ type: 'SET_SCOPE', collections: workingCollections, queryId: q.id });
        const r = resolveQueryResult(q);
        // snapshot risolto (per salvataggio nello stesso turno)
        createdArtifacts[q.id] = makeQueryArtifact({ ...q, sql: r.sql, status: r.status, results: r.results, rowCount: r.rowCount, execMs: r.execMs });
        lastQueryId = q.id;
        artifactIds.push(q.id);
        // transizione running→success fuori dal reducer
        setTimeout(() => dispatch({ type: 'UPDATE_QUERY_RESULT', ...r }), 700);
        parts.push(`query «${q.title}»`);
        break;
      }
      case 'create_chart': {
        const resolved = resolveSource(a.source);
        if (!resolved) { replies.push('Imposta prima uno scope o crea una query da visualizzare.'); break; }
        const chart = makeChartFromVariable({
          title: a.title, chartType: a.chartType, variable: a.variable, groupBy: a.groupBy,
          secondVariable: a.secondVariable, source: resolved.source, collections: resolved.collections,
        });
        if (chart) {
          const artifact = makeChartArtifact(chart);
          createdArtifacts[artifact.id] = artifact;
          dispatch({ type: 'CREATE_ARTIFACT', artifact });
          artifactIds.push(artifact.id);
          parts.push(`grafico ${chart.title}`);
        } else {
          replies.push(`Non ho trovato dati per «${a.variable}»${a.groupBy ? ` per ${a.groupBy}` : ''} nello scope corrente.`);
        }
        break;
      }
      case 'create_analysis': {
        const resolved = resolveSource(a.source);
        if (!resolved) { replies.push('Imposta prima uno scope o crea una query da analizzare.'); break; }
        const chart = makeChartFromAnalysis({
          title: a.title, analysis: a.analysis, variables: a.variables,
          source: resolved.source, collections: resolved.collections,
        });
        if (chart) {
          const artifact = makeChartArtifact(chart);
          createdArtifacts[artifact.id] = artifact;
          dispatch({ type: 'CREATE_ARTIFACT', artifact });
          artifactIds.push(artifact.id);
          parts.push(`analisi ${chart.title}`);
        } else {
          replies.push(`Non ho potuto eseguire l'analisi «${a.analysis}» con le variabili indicate.`);
        }
        break;
      }
      case 'save_query': {
        // target: id esplicito, altrimenti l'ultima query (in batch o nello state)
        let target = a.targetId ? queryArtifactById(a.targetId) : undefined;
        if (!target && lastQueryId) target = queryArtifactById(lastQueryId);
        if (!target) {
          for (let i = state.artifactOrder.length - 1; i >= 0; i--) {
            const art = state.artifacts[state.artifactOrder[i]];
            if (art?.kind === 'query') { target = art; break; }
          }
        }
        if (target && target.kind === 'query') {
          const saved = saveQueryArtifact(target, { name: a.name, visibility: a.visibility });
          dispatch({ type: 'MARK_SAVED', id: target.id, savedId: saved.id });
          parts.push(`query «${target.title}» salvata in Saved Queries`);
        } else {
          replies.push('Non c’è una query da salvare: creane una prima.');
        }
        break;
      }
      case 'answer':
      case 'explain':
        replies.push(a.text);
        break;
    }
  }

  return { summary: parts.join(' · '), replyText: replies.join(' '), artifactIds };
}

// ─── Fallback offline: parser keyword locale → azioni ───
export function fallbackActions(text: string, scopeCollections: string[]): ExploreAction[] {
  const q = text.toLowerCase();
  const actions: ExploreAction[] = [];

  // 0) salva
  if (/(salva|save)\b/.test(q)) { actions.push({ type: 'save_query' }); return actions; }

  // 1) collection citate
  const mentioned: string[] = [];
  for (const c of EXPLORE_COLLECTIONS) {
    const short = c.id.split('-')[0];
    if (q.includes(c.name.toLowerCase()) || q.includes(short)) mentioned.push(c.id);
  }
  const wantsScope = /(scope|lavora|usa|imposta|seleziona|carica|aggiungi)/.test(q);
  if (mentioned.length) {
    if (/(aggiungi|anche|più)/.test(q) && scopeCollections.length) actions.push({ type: 'add_to_scope', collections: mentioned });
    else actions.push({ type: 'set_scope', collections: mentioned });
  }
  const effectiveScope = mentioned.length ? mentioned : scopeCollections;

  const VAR_HINTS: { re: RegExp; v: string }[] = [
    { re: /(et[àa]|age|anni)/, v: 'age' },
    { re: /(sess|gender|maschi|femmin)/, v: 'gender' },
    { re: /(sit[oi]|centr)/, v: 'site_id' },
    { re: /(grav|sever|avvers|adverse)/, v: 'severity' },
    { re: /(arruol|enroll)/, v: 'enrollment_date' },
    { re: /(valor|lab|laborat)/, v: 'lab_value' },
    { re: /(test|esame)/, v: 'test_name' },
    { re: /(stato|status)/, v: 'status' },
    { re: /(flag|anomal)/, v: 'flag' },
  ];
  const matchedVars = VAR_HINTS.filter((h) => h.re.test(q)).map((h) => h.v);

  // 2) correlazione tra due variabili
  if (/correlaz/.test(q) && matchedVars.length >= 2 && effectiveScope.length) {
    actions.push({ type: 'create_chart', title: '', chartType: 'scatter', variable: matchedVars[0], secondVariable: matchedVars[1] });
    return actions;
  }

  // 3) grafico (mono o incrociato "per …")
  const chartIntent = /(distribuz|grafico|conteggi|conta|istogramm|mostra|visualizza|per\s+(sesso|sito|gravità|gravita|stato))/.test(q);
  if (chartIntent && matchedVars.length && effectiveScope.length) {
    const primary = matchedVars[0];
    const groupBy = matchedVars.find((v) => v !== primary);
    const wantsGroup = /\bper\b|raggrupp|diviso/.test(q);
    if (wantsGroup && groupBy) {
      const chartType = /(impil|stacked)/.test(q) ? 'stacked' : 'grouped';
      actions.push({ type: 'create_chart', title: '', chartType, variable: primary, groupBy });
    } else {
      const chartType = /(torta|pie)/.test(q) ? 'pie' : /(linea|trend|tempo)/.test(q) ? 'line' : 'bar';
      actions.push({ type: 'create_chart', title: '', chartType, variable: primary });
    }
    return actions;
  }

  // 4) query
  const queryIntent = /(pazient|trovami|trova|elenca|mostr|seleziona|over|under|tropon|evento|avvers|esam|lab|esegui|query)/.test(q);
  if (queryIntent && (effectiveScope.length || !wantsScope)) {
    actions.push({ type: 'create_query', title: text.slice(0, 40), prompt: text, collections: effectiveScope });
    return actions;
  }

  if (actions.length === 0) {
    actions.push({
      type: 'answer',
      text: 'Posso impostare lo scope (es. «lavora su CARDIO-2024»), creare query («pazienti over 60 con troponina alta»), grafici anche incrociati («età per sito», «correlazione età e valore lab») o salvare una query. Cosa vuoi fare?',
    });
  }
  return actions;
}
