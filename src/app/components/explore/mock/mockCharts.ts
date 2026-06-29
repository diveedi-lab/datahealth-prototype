import type { Distribution } from '../../ingestor/types';
import type {
  ChartDatum, ChartSpec, ChartType, AnalysisType, RichVariable,
} from '../types';
import { getCollection, EXPLORE_COLLECTIONS } from './mockCatalog';

// ─── Risoluzione nome variabile → RichVariable nello scope ───
const ALIASES: Record<string, string> = {
  eta: 'age', età: 'age', age: 'age', anni: 'age',
  sesso: 'gender', sex: 'gender', gender: 'gender', genere: 'gender',
  stato: 'status', status: 'status',
  arruolamento: 'enrollment_date', enrollment: 'enrollment_date', enroll: 'enrollment_date', arruol: 'enrollment_date',
  sito: 'site_id', site: 'site_id', siti: 'site_id', centro: 'site_id',
  valore: 'lab_value', value: 'lab_value', lab: 'lab_value', laboratorio: 'lab_value', lborres: 'lab_value',
  test: 'test_name', esame: 'test_name',
  flag: 'flag', anomalia: 'flag',
  gravita: 'severity', gravità: 'severity', severity: 'severity', severita: 'severity',
};

export function resolveVariable(
  token: string, collections: string[],
): { rich: RichVariable; collectionId: string } | null {
  const raw = (token || '').trim().toLowerCase();
  const key = ALIASES[raw] ?? raw;
  const aliasKey = Object.keys(ALIASES).find((a) => raw.includes(a));
  const mapped = aliasKey ? ALIASES[aliasKey] : null;

  const searchIn = (pool: string[]) => {
    for (const cid of pool) {
      const coll = getCollection(cid);
      if (!coll) continue;
      const hit = coll.richVariables.find(
        (rv) => rv.name === key || rv.name === raw || rv.variable.label.toLowerCase() === raw
          || (mapped ? rv.name === mapped : false),
      );
      if (hit) return { rich: hit, collectionId: cid };
    }
    return null;
  };

  // 1) prima nello scope, 2) poi nell'intero catalogo (così funziona anche se lo
  //    scope non contiene quella variabile)
  const scoped = collections.length ? searchIn(collections) : null;
  if (scoped) return scoped;
  return searchIn(EXPLORE_COLLECTIONS.map((c) => c.id));
}

// ─── Distribuzione → dati grafico ───
export function distToData(dist: Distribution): ChartDatum[] {
  if (dist.kind === 'categorical') return dist.categories.map((c) => ({ name: c.name, value: c.count }));
  if (dist.kind === 'numeric') return dist.bins.map((b) => ({ name: b.range, value: b.count }));
  if (dist.kind === 'date') return dist.bins.map((b) => ({ name: b.name, value: b.count }));
  if (dist.kind === 'boolean') return [{ name: 'Y', value: dist.trueCount }, { name: 'N', value: dist.falseCount }];
  return [];
}

function defaultChartType(dist: Distribution): ChartType {
  if (dist.kind === 'numeric') return 'histogram';
  if (dist.kind === 'date') return 'line';
  return 'bar';
}

function buildAltSpecs(data: ChartDatum[], unit?: string): Record<ChartType, ChartSpec> {
  const total = data.reduce((s, d) => s + d.value, 0);
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0] ?? { name: '—', value: 0 });
  return {
    bar: { chartType: 'bar', data, unit },
    histogram: { chartType: 'histogram', data, unit },
    line: { chartType: 'line', data, unit },
    pie: { chartType: 'pie', data, unit },
    kpi: {
      chartType: 'kpi', data, unit,
      kpi: { value: total.toLocaleString('it-IT'), label: 'totale', sub: `top: ${top.name} (${Math.round((top.value / (total || 1)) * 100)}%)` },
    },
  };
}

function insightFor(rich: RichVariable, data: ChartDatum[]): string {
  const dist = rich.variable.stats!.distribution;
  const label = rich.variable.label;
  if (dist.kind === 'numeric') {
    const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
    return `${label}: distribuzione concentrata nella fascia ${top.name} (${top.value.toLocaleString('it-IT')} record). Media ${dist.mean}, mediana ${dist.median}, range ${dist.min}–${dist.max}.`;
  }
  if (dist.kind === 'date') {
    const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
    return `${label}: picco in ${top.name} (${top.value.toLocaleString('it-IT')}). Intervallo ${dist.min} → ${dist.max}.`;
  }
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  return `${label}: categoria prevalente «${top.name}» con ${Math.round((top.value / total) * 100)}% (${top.value.toLocaleString('it-IT')} su ${total.toLocaleString('it-IT')}).`;
}

// ─── Costruzione chart da una variabile ───
export function buildChart(opts: {
  chartType?: ChartType; variable: string; groupBy?: string; collections: string[];
}): {
  ok: boolean; chartType: ChartType; spec: ChartSpec; altSpecs: Record<ChartType, ChartSpec>;
  insight: string; variableLabel: string; resolvedVar?: string; collectionId?: string;
} | null {
  const resolved = resolveVariable(opts.variable, opts.collections);
  if (!resolved) return null;
  const dist = resolved.rich.variable.stats!.distribution;
  const data = distToData(dist);
  if (data.length === 0) return null;
  const requested = opts.chartType ?? defaultChartType(dist);
  const altSpecs = buildAltSpecs(data);
  const spec = altSpecs[requested] ?? altSpecs.bar;
  return {
    ok: true,
    chartType: requested,
    spec,
    altSpecs,
    insight: insightFor(resolved.rich, data),
    variableLabel: resolved.rich.variable.label,
    resolvedVar: resolved.rich.name,
    collectionId: resolved.collectionId,
  };
}

// ─── Costruzione "analisi" (summary/missingness/...) ───
const ANALYSIS_LABEL: Record<AnalysisType, string> = {
  summary_stats: 'Statistiche descrittive',
  missingness: 'Valori mancanti',
  correlation: 'Correlazione',
  crosstab: 'Tabella incrociata',
  outliers: 'Outlier',
};

export function buildAnalysis(opts: {
  analysis: AnalysisType; variables: string[]; collections: string[];
}): {
  ok: boolean; chartType: ChartType; spec: ChartSpec; altSpecs: Record<ChartType, ChartSpec>;
  insight: string; title: string; resolvedVars: string[]; collectionId?: string;
} | null {
  const resolvedList = opts.variables
    .map((v) => resolveVariable(v, opts.collections))
    .filter(Boolean) as { rich: RichVariable; collectionId: string }[];
  if (resolvedList.length === 0) return null;
  const first = resolvedList[0];
  const dist = first.rich.variable.stats!.distribution;
  const label = ANALYSIS_LABEL[opts.analysis];

  if (opts.analysis === 'missingness') {
    const data: ChartDatum[] = resolvedList.map((r) => ({
      name: r.rich.variable.label,
      value: +(r.rich.variable.stats!.missingPct.toFixed(1)),
    }));
    const altSpecs = buildAltSpecs(data, '%');
    return {
      ok: true, chartType: 'bar', spec: altSpecs.bar, altSpecs,
      insight: `Valori mancanti per variabile (in %). Più alta: ${data.reduce((a, b) => (b.value > a.value ? b : a), data[0]).name}.`,
      title: `${label} · ${resolvedList.map((r) => r.rich.variable.label).join(', ')}`,
      resolvedVars: resolvedList.map((r) => r.rich.name),
      collectionId: first.collectionId,
    };
  }

  if (opts.analysis === 'summary_stats' && dist.kind === 'numeric') {
    const data: ChartDatum[] = [
      { name: 'min', value: dist.min }, { name: 'media', value: dist.mean },
      { name: 'mediana', value: dist.median }, { name: 'max', value: dist.max },
    ];
    const altSpecs = buildAltSpecs(data);
    return {
      ok: true, chartType: 'bar', spec: altSpecs.bar, altSpecs,
      insight: `${first.rich.variable.label}: media ${dist.mean}, mediana ${dist.median}, range ${dist.min}–${dist.max}.`,
      title: `${label} · ${first.rich.variable.label}`,
      resolvedVars: [first.rich.name], collectionId: first.collectionId,
    };
  }

  // fallback: usa la distribuzione della prima variabile.
  // Per summary_stats su variabili NON numeriche non esistono min/media/mediana:
  // mostriamo le frequenze e rietichettiamo per non spacciare conteggi per statistiche.
  const data = distToData(dist);
  const altSpecs = buildAltSpecs(data);
  const effectiveLabel = opts.analysis === 'summary_stats' && dist.kind !== 'numeric' ? 'Frequenze' : label;
  return {
    ok: true, chartType: dist.kind === 'numeric' ? 'histogram' : 'bar', spec: altSpecs.bar, altSpecs,
    insight: insightFor(first.rich, data),
    title: `${effectiveLabel} · ${first.rich.variable.label}`,
    resolvedVars: [first.rich.name], collectionId: first.collectionId,
  };
}
