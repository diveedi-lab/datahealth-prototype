import type {
  ExploreQuery, ExploreChart, ChartSource, ChartType, AnalysisType,
} from './types';
import { genId } from './ids';
import { buildQueryResult } from './mock/mockResults';
import { buildChart, buildAnalysis } from './mock/mockCharts';

// ─── Query ───
// Crea una query in stato "running"; il risultato viene applicato poco dopo
// (transizione running→success fuori dal reducer, come da pattern QueryTool).
export function makeRunningQuery(title: string, prompt: string, collections: string[]): ExploreQuery {
  return {
    id: genId('q'),
    title: title || prompt.slice(0, 40),
    prompt,
    sql: '-- generazione SQL…',
    collections: collections.length ? collections : ['cardio-2024'],
    status: 'running',
    results: [],
    rowCount: 0,
    execMs: 0,
    createdAt: Date.now(),
  };
}

export function resolveQueryResult(q: ExploreQuery) {
  const r = buildQueryResult(q.prompt, q.collections);
  return { id: q.id, sql: r.sql, status: r.status, results: r.results, rowCount: r.rowCount, execMs: r.execMs };
}

// ─── Chart da variabile ───
export function makeChartFromVariable(opts: {
  title: string; chartType?: ChartType; variable: string; groupBy?: string;
  source: ChartSource; collections: string[];
}): ExploreChart | null {
  const built = buildChart({ chartType: opts.chartType, variable: opts.variable, groupBy: opts.groupBy, collections: opts.collections });
  if (!built) return null;
  return {
    id: genId('c'),
    title: opts.title || `${built.chartType === 'kpi' ? 'KPI' : 'Distribuzione'} ${built.variableLabel}`,
    kind: 'chart',
    chartType: built.chartType,
    variable: built.resolvedVar,
    groupBy: opts.groupBy,
    source: opts.source,
    spec: built.spec,
    altSpecs: built.altSpecs,
    insight: built.insight,
    createdAt: Date.now(),
  };
}

// ─── Chart da analisi ───
export function makeChartFromAnalysis(opts: {
  title: string; analysis: AnalysisType; variables: string[];
  source: ChartSource; collections: string[];
}): ExploreChart | null {
  const built = buildAnalysis({ analysis: opts.analysis, variables: opts.variables, collections: opts.collections });
  if (!built) return null;
  return {
    id: genId('c'),
    title: opts.title || built.title,
    kind: 'analysis',
    chartType: built.chartType,
    analysis: opts.analysis,
    variable: built.resolvedVars[0],
    source: opts.source,
    spec: built.spec,
    altSpecs: built.altSpecs,
    insight: built.insight,
    createdAt: Date.now(),
  };
}
