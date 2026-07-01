import type { Variable } from '../ingestor/types';
import type { ResultTable } from '../shared/query';

export const EXPLORE_SCHEMA_VERSION = 2;

// ─── Scope: l'insieme di lavoro (collection + opzionale query di partenza) ───
export interface ScopeState {
  collections: string[];   // id delle collection (es. 'cardio-2024')
  queryId: string | null;  // id di una query-artifact usata come base
}

// ─── Catalogo collection ───
export type ColumnType = 'string' | 'integer' | 'float' | 'date' | 'boolean' | 'id';

export interface ExploreColumn {
  name: string;
  type: ColumnType;
  pk?: boolean;
  fk?: { table: string; column: string };
  nullable?: boolean;
  description: string;
}

export interface ExploreTable {
  name: string;
  label: string;
  color: string;
  rowCount: number;
  columns: ExploreColumn[];
  previewRows?: Array<Record<string, string | number>>;  // righe d'esempio per l'anteprima nei nodi
}

// Variabile "ricca" con distribuzione (per le analisi/grafici in NL)
export interface RichVariable {
  name: string;     // chiave usata nei comandi (es. 'age', 'sex', 'lab_value')
  table: string;    // tabella di appartenenza
  variable: Variable;
}

export interface ExploreCollection {
  id: string;
  name: string;
  description: string;
  color: string;        // hex per i grafici/ERD
  dotClass: string;     // classe tailwind per il pallino (riuso DB_COLORS)
  targetDB: string;
  tableCount: number;
  variableCount: number;
  rowsLabel: string;    // '1.2M'
  sizeGB: number;
  tables: ExploreTable[];
  richVariables: RichVariable[];
}

// ─── Query nel workspace ───
export type QueryStatus = 'idle' | 'running' | 'success' | 'empty' | 'error';

export interface ExploreQuery {
  id: string;
  title: string;
  prompt: string;          // linguaggio naturale
  sql: string;
  collections: string[];   // snapshot dello scope al momento della creazione
  status: QueryStatus;
  results: ResultTable[];   // una o più tabelle risultanti
  rowCount: number;
  execMs: number;
  createdAt: number;
}

// ─── Chart / analisi ───
export type ChartType =
  | 'bar' | 'line' | 'pie' | 'histogram' | 'kpi'                 // monovariati
  | 'grouped' | 'stacked' | 'multiline' | 'scatter' | 'crosstab'; // multi-serie / incroci
export type AnalysisType = 'summary_stats' | 'missingness' | 'correlation' | 'crosstab' | 'outliers';

export interface ChartDatum { name: string; value: number; }
// riga multi-serie: { name: 'Site A', F: 120, M: 100 }
export interface SeriesRow { name: string; [series: string]: string | number; }
export interface ScatterPoint { x: number; y: number; label?: string; group?: string; }

export interface ChartSpec {
  chartType: ChartType;
  // monovariato (sempre valorizzato per retro-compatibilità):
  data: ChartDatum[];
  // multi-serie (grouped/stacked/multiline/crosstab):
  series?: string[];          // es. ['F','M'] o ['Mild','Moderate','Severe']
  rows?: SeriesRow[];         // es. [{name:'18–30', F:80, M:60}, …]
  stacked?: boolean;
  // scatter / correlazione:
  points?: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  unit?: string;
  kpi?: { value: string; label: string; sub?: string };
}

export type ChartSource =
  | { kind: 'query'; queryId: string }
  | { kind: 'collection'; collectionId: string };

export interface ExploreChart {
  id: string;
  title: string;
  kind: 'chart' | 'analysis';
  chartType: ChartType;
  variable?: string;
  groupBy?: string;
  secondVariable?: string;
  analysis?: AnalysisType;
  source: ChartSource;
  spec: ChartSpec;
  altSpecs?: Partial<Record<ChartType, ChartSpec>>;  // varianti per i toggle
  insight: string;
  createdAt: number;
}

// ─── Artifact (unione discriminata: grafico | query) ───
export type ArtifactKind = 'chart' | 'query';

export interface ChartArtifact {
  id: string;
  kind: 'chart';
  title: string;
  createdAt: number;
  chart: ExploreChart;
}

export interface QueryArtifact {
  id: string;
  kind: 'query';
  title: string;
  createdAt: number;
  query: ExploreQuery;
  saved?: boolean;
  savedId?: string;
}

export type Artifact = ChartArtifact | QueryArtifact;

// Riferimento leggero (per switcher e card)
export interface ArtifactRef {
  id: string;
  kind: ArtifactKind;
  title: string;
}

// ─── Chat ───
export interface ExploreChatMsg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionsSummary?: string;
  artifactIds?: string[];   // artifact creati da questo messaggio (card inline)
}

// ─── Stato completo (serializzato in localStorage) ───
export interface ExploreState {
  schemaVersion: number;
  id: string;
  scope: ScopeState;
  artifacts: Record<string, Artifact>;
  artifactOrder: string[];
  currentArtifactId: string | null;
  chatLog: ExploreChatMsg[];
  busy: boolean;
}

// Richiesta di apertura dello Structure Explorer
export type StructureRequest =
  | { mode: 'collection'; collectionId: string }
  | { mode: 'query'; queryId: string };
