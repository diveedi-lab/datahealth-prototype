import type { Distribution } from '../../ingestor/types';
import type {
  ChartDatum, ChartSpec, ChartType, AnalysisType, RichVariable, SeriesRow,
} from '../types';
import { getCollection, EXPLORE_COLLECTIONS } from './mockCatalog';
import { getCrossDist, SCATTER_AGE_LAB } from './mockCrossDist';

// Shape di ritorno comune ai builder di grafici
export interface BuiltChart {
  ok: boolean;
  chartType: ChartType;
  spec: ChartSpec;
  altSpecs: Partial<Record<ChartType, ChartSpec>>;
  insight: string;
  variableLabel: string;
  resolvedVar?: string;
  secondVar?: string;
  collectionId?: string;
}

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

function buildAltSpecs(data: ChartDatum[], unit?: string): Partial<Record<ChartType, ChartSpec>> {
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
}): BuiltChart | null {
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
  ok: boolean; chartType: ChartType; spec: ChartSpec; altSpecs: Partial<Record<ChartType, ChartSpec>>;
  insight: string; title: string; resolvedVars: string[]; collectionId?: string;
} | null {
  // correlazione / cross-tab → grafici incrociati su due variabili
  if (opts.analysis === 'correlation' && opts.variables.length >= 2) {
    const sc = buildScatterChart({ variable: opts.variables[0], secondVariable: opts.variables[1], collections: opts.collections });
    if (sc) return { ...sc, title: `Correlazione · ${sc.variableLabel}`, resolvedVars: [sc.resolvedVar!, sc.secondVar!].filter(Boolean) };
  }
  if (opts.analysis === 'crosstab' && opts.variables.length >= 2) {
    const cx = buildCrossChart({ variable: opts.variables[0], groupBy: opts.variables[1], family: 'crosstab', collections: opts.collections });
    if (cx) return { ...cx, title: `Tabella incrociata · ${cx.variableLabel}`, resolvedVars: [cx.resolvedVar!, cx.secondVar!].filter(Boolean) };
  }

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
    ok: true, chartType: dist.kind === 'numeric' ? 'histogram' : 'bar', spec: altSpecs.bar!, altSpecs,
    insight: insightFor(first.rich, data),
    title: `${effectiveLabel} · ${first.rich.variable.label}`,
    resolvedVars: [first.rich.name], collectionId: first.collectionId,
  };
}

// ─── Grafici incrociati (grouped/stacked/multiline/crosstab) ───
export function buildCrossChart(opts: {
  variable: string; groupBy: string; family?: ChartType; collections: string[];
}): BuiltChart | null {
  const r1 = resolveVariable(opts.variable, opts.collections);
  const r2 = resolveVariable(opts.groupBy, opts.collections);
  if (!r1 || !r2) return null;
  const cd = getCrossDist(r1.collectionId, r1.rich.name, r2.rich.name);
  if (!cd) return null;

  const series = cd.colCats;
  const rows: SeriesRow[] = cd.rowCats.map((rc, ri) => {
    const row: SeriesRow = { name: rc };
    series.forEach((cc, ci) => { row[cc] = cd.matrix[ri][ci]; });
    return row;
  });
  const dataTotals: ChartDatum[] = cd.rowCats.map((rc, ri) => ({
    name: rc, value: cd.matrix[ri].reduce((s, n) => s + n, 0),
  }));
  const colTotals = series.map((_, ci) => cd.rowCats.reduce((s, __, ri) => s + cd.matrix[ri][ci], 0));
  const grand = colTotals.reduce((s, n) => s + n, 0) || 1;
  const topIdx = colTotals.reduce((a, b, i) => (b > colTotals[a] ? i : a), 0);

  const specOf = (ft: ChartType): ChartSpec => ({
    chartType: ft, data: dataTotals, series, rows, stacked: ft === 'stacked',
  });
  const altSpecs: Partial<Record<ChartType, ChartSpec>> = {
    grouped: specOf('grouped'),
    stacked: specOf('stacked'),
    multiline: specOf('multiline'),
    crosstab: specOf('crosstab'),
    kpi: { chartType: 'kpi', data: dataTotals, kpi: { value: grand.toLocaleString('it-IT'), label: 'totale', sub: `${series[topIdx]} ${Math.round((colTotals[topIdx] / grand) * 100)}%` } },
  };
  const isDate = r1.rich.variable.type === 'date';
  const family = opts.family ?? (isDate ? 'multiline' : 'grouped');

  return {
    ok: true,
    chartType: family,
    spec: altSpecs[family] ?? altSpecs.grouped!,
    altSpecs,
    insight: `${r1.rich.variable.label} per ${r2.rich.variable.label}: «${series[topIdx]}» è la serie prevalente (${Math.round((colTotals[topIdx] / grand) * 100)}% del totale).`,
    variableLabel: `${r1.rich.variable.label} × ${r2.rich.variable.label}`,
    resolvedVar: r1.rich.name,
    secondVar: r2.rich.name,
    collectionId: r1.collectionId,
  };
}

// ─── Scatter / correlazione tra due variabili numeriche ───
export function buildScatterChart(opts: {
  variable: string; secondVariable: string; collections: string[];
}): BuiltChart | null {
  const r1 = resolveVariable(opts.variable, opts.collections);
  const r2 = resolveVariable(opts.secondVariable, opts.collections);
  if (!r1 || !r2) return null;
  // l'unico scatter autorizzato (con dati) è età × valore lab, in qualsiasi ordine
  const names = new Set([r1.rich.name, r2.rich.name]);
  if (!(names.has('age') && names.has('lab_value'))) return null;

  // assi coerenti coi dati (x = età, y = valore lab) a prescindere dall'ordine richiesto
  const ageVar = r1.rich.name === 'age' ? r1 : r2;
  const labVar = r1.rich.name === 'lab_value' ? r1 : r2;
  const points = SCATTER_AGE_LAB;
  const r = 0.41;
  const spec: ChartSpec = {
    chartType: 'scatter', data: [], points,
    xLabel: ageVar.rich.variable.label, yLabel: labVar.rich.variable.label,
  };
  return {
    ok: true,
    chartType: 'scatter',
    spec,
    altSpecs: {
      scatter: spec,
      kpi: { chartType: 'kpi', data: [], kpi: { value: `r≈${r.toFixed(2)}`, label: 'correlazione', sub: 'moderata positiva' } },
    },
    insight: `Correlazione moderata positiva tra ${ageVar.rich.variable.label} e ${labVar.rich.variable.label} (r≈${r.toFixed(2)}): a età più alta tendono ad accompagnarsi valori di laboratorio più alti.`,
    variableLabel: `${ageVar.rich.variable.label} × ${labVar.rich.variable.label}`,
    resolvedVar: r1.rich.name,
    secondVar: r2.rich.name,
    collectionId: r1.collectionId,
  };
}
