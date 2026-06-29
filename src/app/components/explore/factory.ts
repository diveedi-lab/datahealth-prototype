import type {
  ExploreQuery, ExploreChart, ChartArtifact, QueryArtifact,
  ChartSource, ChartType, AnalysisType,
} from './types';
import { genId } from './ids';
import { buildQueryResult } from './mock/mockResults';
import { buildChart, buildAnalysis, buildCrossChart, buildScatterChart } from './mock/mockCharts';

const CROSS_FAMILIES: ChartType[] = ['grouped', 'stacked', 'multiline', 'crosstab'];

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

// ─── Chart da variabile (mono o incrociato) ───
export function makeChartFromVariable(opts: {
  title: string; chartType?: ChartType; variable: string; groupBy?: string; secondVariable?: string;
  source: ChartSource; collections: string[];
}): ExploreChart | null {
  // La famiglia richiesta decide il builder; il campo (groupBy/secondVariable) è solo la 2ª variabile.
  const ct = opts.chartType;
  const isCrossFamily = !!ct && CROSS_FAMILIES.includes(ct);
  let built = null as ReturnType<typeof buildChart>;
  if (ct === 'scatter') {
    const second = opts.secondVariable ?? opts.groupBy;
    built = second ? buildScatterChart({ variable: opts.variable, secondVariable: second, collections: opts.collections }) : null;
  } else if (isCrossFamily) {
    const second = opts.groupBy ?? opts.secondVariable;
    built = second ? buildCrossChart({ variable: opts.variable, groupBy: second, family: ct, collections: opts.collections }) : null;
  } else if (opts.secondVariable) {
    built = buildScatterChart({ variable: opts.variable, secondVariable: opts.secondVariable, collections: opts.collections });
  } else if (opts.groupBy) {
    built = buildCrossChart({ variable: opts.variable, groupBy: opts.groupBy, family: undefined, collections: opts.collections });
  } else {
    built = buildChart({ chartType: ct, variable: opts.variable, collections: opts.collections });
  }
  if (!built) return null;
  return {
    id: genId('c'),
    title: opts.title || `${built.chartType === 'kpi' ? 'KPI' : 'Grafico'} ${built.variableLabel}`,
    kind: 'chart',
    chartType: built.chartType,
    variable: built.resolvedVar,
    groupBy: opts.groupBy,
    secondVariable: opts.secondVariable ?? built.secondVar,
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

// ─── Wrapping in Artifact ───
export function makeQueryArtifact(query: ExploreQuery): QueryArtifact {
  return { id: query.id, kind: 'query', title: query.title, createdAt: query.createdAt, query, saved: false };
}

export function makeChartArtifact(chart: ExploreChart): ChartArtifact {
  return { id: chart.id, kind: 'chart', title: chart.title, createdAt: chart.createdAt, chart };
}
