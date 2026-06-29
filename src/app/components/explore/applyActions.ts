import type { Dispatch } from 'react';
import type { ExploreState, ChartSource } from './types';
import type { ExploreReducerAction } from './state/exploreReducer';
import type {
  ExploreAction, CreateQueryAction, CreateChartAction, CreateAnalysisAction,
} from './actions';
import { CHART_TYPES, ANALYSIS_TYPES } from './actions';
import { EXPLORE_COLLECTIONS, resolveCollectionId, getCollection } from './mock/mockCatalog';
import { makeRunningQuery, resolveQueryResult, makeChartFromVariable, makeChartFromAnalysis } from './factory';

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
): { summary: string; replyText: string } {
  const { state, dispatch } = ctx;
  const parts: string[] = [];
  const replies: string[] = [];

  let workingCollections = [...state.scope.collections];
  let lastQueryId: string | null = state.scope.queryId;
  const createdQueries: Record<string, { collections: string[] }> = {};

  const ensureInScope = (ids: string[]) => {
    const missing = ids.filter((id) => !workingCollections.includes(id));
    if (missing.length) {
      dispatch({ type: 'ADD_COLLECTIONS', collections: missing });
      workingCollections = [...workingCollections, ...missing];
    }
  };

  const resolveSource = (provided: ChartSource | undefined): { source: ChartSource; collections: string[] } | null => {
    if (provided) {
      if (provided.kind === 'query' && (createdQueries[provided.queryId] || state.queries[provided.queryId])) {
        const cols = createdQueries[provided.queryId]?.collections ?? state.queries[provided.queryId]?.collections ?? workingCollections;
        return { source: provided, collections: cols };
      }
      if (provided.kind === 'collection' && KNOWN_IDS.has(provided.collectionId)) {
        ensureInScope([provided.collectionId]);
        return { source: provided, collections: [provided.collectionId] };
      }
      // sorgente esplicita ma non risolvibile → non rimbalzare su una sorgente diversa
      return null;
    }
    if (lastQueryId && (createdQueries[lastQueryId] || state.queries[lastQueryId])) {
      const cols = createdQueries[lastQueryId]?.collections ?? state.queries[lastQueryId]?.collections ?? workingCollections;
      return { source: { kind: 'query', queryId: lastQueryId }, collections: cols };
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
        dispatch({ type: 'CREATE_QUERY', query: q });
        createdQueries[q.id] = { collections: q.collections };
        lastQueryId = q.id;
        const r = resolveQueryResult(q);
        // transizione running→success fuori dal reducer
        setTimeout(() => dispatch({ type: 'SET_QUERY_RESULT', ...r }), 700);
        parts.push(`query «${q.title}»`);
        break;
      }
      case 'create_chart': {
        const resolved = resolveSource(a.source);
        if (!resolved) { replies.push('Imposta prima uno scope o crea una query da visualizzare.'); break; }
        const chart = makeChartFromVariable({
          title: a.title, chartType: a.chartType, variable: a.variable, groupBy: a.groupBy,
          source: resolved.source, collections: resolved.collections,
        });
        if (chart) {
          dispatch({ type: 'CREATE_CHART', chart });
          parts.push(`grafico ${chart.title}`);
        } else {
          replies.push(`Non ho trovato la variabile «${a.variable}» nello scope corrente.`);
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
          dispatch({ type: 'CREATE_CHART', chart });
          parts.push(`analisi ${chart.title}`);
        } else {
          replies.push(`Non ho trovato le variabili per l'analisi «${a.analysis}».`);
        }
        break;
      }
      case 'answer':
      case 'explain':
        replies.push(a.text);
        break;
    }
  }

  return { summary: parts.join(' · '), replyText: replies.join(' ') };
}

// ─── Fallback offline: parser keyword locale → azioni ───
export function fallbackActions(text: string, scopeCollections: string[]): ExploreAction[] {
  const q = text.toLowerCase();
  const actions: ExploreAction[] = [];

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

  // 2) grafico / distribuzione / conteggio
  const chartIntent = /(distribuz|grafico|conteggi|conta|istogramm|mostra|visualizza|per\s+(sesso|sito|gravità|gravita))/.test(q);
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
  if (chartIntent && effectiveScope.length) {
    const hit = VAR_HINTS.find((h) => h.re.test(q));
    if (hit) {
      const chartType = /(torta|pie)/.test(q) ? 'pie' : /(linea|trend|tempo)/.test(q) ? 'line' : 'bar';
      actions.push({ type: 'create_chart', title: '', chartType, variable: hit.v });
      return actions;
    }
  }

  // 3) query (intento di interrogazione)
  const queryIntent = /(pazient|trovami|trova|elenca|mostr|seleziona|over|under|tropon|evento|avvers|esam|lab|esegui|query)/.test(q);
  if (queryIntent && (effectiveScope.length || !wantsScope)) {
    actions.push({ type: 'create_query', title: text.slice(0, 40), prompt: text, collections: effectiveScope });
    return actions;
  }

  if (actions.length === 0) {
    actions.push({
      type: 'answer',
      text: 'Posso impostare lo scope (es. «lavora su CARDIO-2024»), creare query («pazienti over 60 con troponina alta») o grafici («distribuzione dell’età»). Cosa vuoi fare?',
    });
  }
  return actions;
}
